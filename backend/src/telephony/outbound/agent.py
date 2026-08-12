"""Outbound telephony agent — places calls and talks to whoever answers.

Unlike the inbound agent, this one does the dialling. It waits to be dispatched
into a room with a phone number in the job metadata, then asks LiveKit to call
that number and bridge it into the room.

Run the worker with:

    uv run python src/telephony/outbound/agent.py dev

Then trigger a call from another terminal:

    uv run python src/telephony/outbound/dial.py --to +15551234567

See src/telephony/README.md for the trunk setup.
"""

import asyncio
import json
import logging
import os

from dotenv import load_dotenv
from livekit import api, rtc
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    JobContext,
    JobProcess,
    RunContext,
    cli,
    function_tool,
    room_io,
    tokenize,
)
from livekit.plugins import deepgram, google, murf, noise_cancellation, silero
from livekit.plugins.turn_detector.multilingual import MultilingualModel

import db

logger = logging.getLogger("outbound-agent")

load_dotenv(".env.local")

# Required — create this with `lk sip outbound create` (see src/telephony/README.md).
OUTBOUND_TRUNK_ID = os.getenv("LIVEKIT_SIP_OUTBOUND_TRUNK_ID")

# Optional — a phone number to transfer people to when they ask for a human.
TRANSFER_TO_NUMBER = os.getenv("TRANSFER_TO_NUMBER")

# Prompt and opening tailored for Learning and Literacy daily practice track
SYSTEM_PROMPT = """You are Saira, an AI Learning and Literacy Assistant calling the learner for their scheduled daily practice session.

Step 4 Opening Rule: Since outbound calls are unexpected, always open by clearly stating:
1. Who is calling (Saira, your AI Learning and Literacy Assistant).
2. Why you are calling (for your requested daily practice session).
3. How to stop or reschedule (saying "stop", "cancel", or "not now").

AFTER OPENING:
- If the learner says "yes", "okay", or agrees to practice, immediately start the practice session (e.g. ask them what topic, English/Hindi practice, or vocabulary word they want to work on today).

HUMAN HELP ESCALATION:
- If the learner is upset or explicitly requests help from a human teacher, ask for their permission to create a help request: "May I share your details with our human teacher support team?"
- If they say yes, call `create_escalation(..., user_consent_granted=True)` with a short summary, urgency, language, and preferred follow-up. Do not include sensitive private data like passwords or OTPs. State their Reference ID and next steps clearly.

LANGUAGE & SCRIPT:
Always write every language in its own native script.
Hindi → Devanagari (नमस्ते), never romanized (never "namaste").
Same rule for all non-English languages.

Keep responses short, engaging, and conversational — no formatting, markdown, emojis, or symbols. If the person asks for a human, use the transfer_to_human tool or create_escalation tool. If you reach a voicemail or answering machine, use the detected_answering_machine tool."""

# The first thing the person hears when they pick up.
GREETING = "Hello! This is Saira, your AI Learning and Literacy Assistant, calling for your daily practice session. Is now a good time for a quick practice?"

# The identity LiveKit gives the person we call. Used to transfer them later.
CALLEE_IDENTITY = "phone-user"


class OutboundAgent(Agent):
    def __init__(self, ctx: JobContext) -> None:
        super().__init__(instructions=SYSTEM_PROMPT)
        self.ctx = ctx

    @function_tool
    async def transfer_to_human(self, context: RunContext) -> str:
        """Transfer the person to a human colleague.

        Use this when they explicitly ask for a person, or when you cannot help
        them with their request.
        """
        if not TRANSFER_TO_NUMBER:
            return "Transfers are not available on this line. Offer to have someone call back instead."

        # Tell them before transferring — the SIP transfer cuts off the audio.
        await context.session.generate_reply(
            instructions="Tell them you're connecting them to a colleague now."
        )

        logger.info("transferring call to %s", TRANSFER_TO_NUMBER)
        try:
            await self.ctx.api.sip.transfer_sip_participant(
                api.TransferSIPParticipantRequest(
                    room_name=self.ctx.room.name,
                    participant_identity=CALLEE_IDENTITY,
                    transfer_to=f"tel:{TRANSFER_TO_NUMBER}",
                    play_dialtone=True,
                )
            )
        except Exception:
            logger.exception("transfer failed")
            return "The transfer did not go through. Apologize and offer a call back."

        return "Transferred."

    @function_tool
    async def create_escalation(
        self,
        context: RunContext,
        who_needs_help: str,
        what_happened: str,
        checked_details: str,
        urgency: str,
        language: str,
        preferred_followup: str,
        user_consent_granted: bool,
    ) -> str:
        """Create a human help request/escalation for a teacher or support staff.

        IMPORTANT CRITERIA:
        1. BEFORE calling this tool, you MUST ask the caller for permission to submit a human help request:
           "I can request help from a human teacher for you. May I share your name, what happened, language, and contact preference with our teacher support team?"
        2. Set user_consent_granted=True ONLY IF the caller explicitly agreed/said yes.
        3. Do NOT include sensitive private information such as passwords, OTPs, PINs, or financial account numbers.

        Args:
            who_needs_help: Name or ID of the learner requesting assistance.
            what_happened: Brief summary of the issue (e.g. 'Learner is upset with math topic' or 'Needs human teacher guidance').
            checked_details: What the agent already checked or attempted (e.g. 'Checked basic addition exercises, learner remained confused').
            urgency: Urgency level ('Low', 'Medium', or 'High').
            language: Learner's preferred language (e.g. 'English', 'Hindi').
            preferred_followup: Preferred contact method (e.g. 'Phone call', 'Email', 'Callback during school hours').
            user_consent_granted: Must be True if the caller gave explicit permission.
        """
        if not user_consent_granted:
            return "Escalation request cancelled. User did not grant permission to share their details."

        res = db.save_escalation(
            who_needs_help=who_needs_help,
            what_happened=what_happened,
            checked_details=checked_details,
            urgency=urgency,
            language=language,
            preferred_followup=preferred_followup,
        )

        escalation_id = res["escalation_id"]
        return (
            f"Escalation request successfully created and logged to support database!\n"
            f"Reference ID: {escalation_id}\n"
            f"Status: OPEN\n"
            f"Instructions for caller: Give the caller their Reference ID ({escalation_id}). "
            f"Explain that a human teacher or support team member will review the request and follow up via their preferred method ({preferred_followup}). "
            f"Do NOT promise immediate response unless specified."
        )

    @function_tool
    async def detected_answering_machine(self, context: RunContext) -> str:
        """Hang up because the call reached a voicemail or answering machine.

        Use this as soon as you hear a recorded greeting rather than a live person.
        """
        logger.info("answering machine detected — hanging up")
        await self._hangup()
        return "Call ended."

    async def _hangup(self) -> None:
        """Delete the room, which drops the SIP leg and ends the phone call."""
        await self.ctx.api.room.delete_room(
            api.DeleteRoomRequest(room=self.ctx.room.name)
        )


server = AgentServer()


def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


server.setup_fnc = prewarm


def phone_number_from_metadata(ctx: JobContext) -> str | None:
    """Read the number to dial out of the dispatch metadata set by dial.py."""
    metadata = ctx.job.metadata
    if not metadata:
        return None
    try:
        return json.loads(metadata).get("phone_number")
    except json.JSONDecodeError:
        # Allow a bare phone number as metadata too, for quick `lk dispatch` tests.
        return metadata.strip() or None


@server.rtc_session(agent_name="outbound-agent")
async def outbound_agent(ctx: JobContext):
    ctx.log_context_fields = {
        "room": ctx.room.name,
    }

    phone_number = phone_number_from_metadata(ctx)
    if not phone_number:
        logger.error(
            "no phone number in job metadata — dispatch with "
            '{"phone_number": "+15551234567"}'
        )
        ctx.shutdown()
        return

    if not OUTBOUND_TRUNK_ID:
        logger.error("LIVEKIT_SIP_OUTBOUND_TRUNK_ID is not set — cannot place calls")
        ctx.shutdown()
        return

    await ctx.connect()

    # Same voice pipeline as src/agent.py — see that file for the annotated version.
    session = AgentSession(
        stt=deepgram.STT(model="nova-3", language="multi"),
        llm=google.LLM(
            model="gemini-2.5-flash",
        ),
        tts=murf.TTS(
            voice="Anisha",
            style="Conversation",
            tokenizer=tokenize.basic.SentenceTokenizer(min_sentence_len=2),
            text_pacing=True,
        ),
        turn_detection=MultilingualModel(),
        vad=ctx.proc.userdata["vad"],
        preemptive_generation=True,
    )

    # Start the session while the phone is still ringing so the models are warm
    # by the time somebody picks up.
    session_started = asyncio.create_task(
        session.start(
            agent=OutboundAgent(ctx),
            room=ctx.room,
            room_options=room_io.RoomOptions(
                audio_input=room_io.AudioInputOptions(
                    # BVCTelephony is tuned for the narrow frequency range of phone audio.
                    noise_cancellation=lambda params: (
                        noise_cancellation.BVCTelephony()
                        if params.participant.kind
                        == rtc.ParticipantKind.PARTICIPANT_KIND_SIP
                        else noise_cancellation.BVC()
                    ),
                ),
            ),
        )
    )

    logger.info("dialing %s", phone_number)
    try:
        # wait_until_answered means this returns once the call connects — if the
        # number is busy, declines, or never answers, it raises instead.
        await ctx.api.sip.create_sip_participant(
            api.CreateSIPParticipantRequest(
                room_name=ctx.room.name,
                sip_trunk_id=OUTBOUND_TRUNK_ID,
                sip_call_to=phone_number,
                participant_identity=CALLEE_IDENTITY,
                participant_name="Phone user",
                wait_until_answered=True,
            )
        )
    except api.TwirpError as e:
        logger.error(
            "call to %s was not answered: %s (%s)",
            phone_number,
            e.message,
            e.metadata.get("sip_status"),
        )
        session_started.cancel()
        ctx.shutdown()
        return

    await session_started

    # Speak first — they just picked up an unexpected call and won't say anything.
    await session.say(GREETING, allow_interruptions=True)


if __name__ == "__main__":
    cli.run_app(server)
