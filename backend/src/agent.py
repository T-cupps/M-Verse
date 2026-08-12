import asyncio
import json
import logging
import re
import urllib.error
import urllib.request
from datetime import datetime, timezone

from dotenv import load_dotenv
from livekit import rtc
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

# pyrefly: ignore [missing-import]
from prompt import SYSTEM_PROMPT

logger = logging.getLogger("agent")

load_dotenv(".env.local")


class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(instructions=SYSTEM_PROMPT)

    @function_tool
    async def lookup_caller(self, context: RunContext, user_id_or_name: str) -> str:
        """Look up a caller by their user ID or name in the database.

        Use this tool when a caller introduces themselves by name or ID, or when checking for past learning history.

        Args:
            user_id_or_name: The name or user ID of the caller to look up.
        """
        logger.info(f"Looking up caller: {user_id_or_name}")
        user = db.get_user(user_id_or_name)
        if not user:
            return f"No user record found for '{user_id_or_name}'."
        return json.dumps(user)

    @function_tool
    async def save_caller_info(
        self,
        context: RunContext,
        user_id: str,
        name: str,
        language_preference: str = "English",
        current_level: str = "",
        topics_covered: str = "",
        mistakes_they_keep_making: str = "",
    ) -> str:
        """Save or update caller information and learning track facts.

        IMPORTANT: ONLY call this tool AFTER asking the caller for explicit permission to save their information and receiving affirmative consent! Do NOT save if the caller declines.

        Args:
            user_id: Unique identifier for the user (or caller's name/phone if ID not specified).
            name: Caller's name.
            language_preference: User's preferred language (e.g. English, Hindi, Hinglish).
            current_level: Current learning level (e.g. Beginner, Primary Math, Class 5 English).
            topics_covered: Topics or concepts covered during interactions (e.g. Fractions, Vocabulary, Multiplication).
            mistakes_they_keep_making: Repeated errors or concepts needing work (e.g. Denominator addition, Silent letters).
        """
        logger.info(f"Saving caller info for user_id={user_id}, name={name}")
        db.save_user(
            user_id=user_id,
            name=name,
            language_preference=language_preference,
            current_level=current_level,
            topics_covered=topics_covered,
            mistakes_they_keep_making=mistakes_they_keep_making,
        )
        return f"Successfully saved user record for {name}."

    @function_tool
    async def lookup_word_definition(self, context: RunContext, word: str) -> str:
        """Fetch real-time English word definitions, pronunciations, meanings, parts of speech, and example usage from a live dictionary API for literacy and learning practice.

        Use this tool whenever the learner asks for the definition, meaning, spelling, pronunciation, or usage example of a specific English word. Do NOT call this tool for general conversational chat or math questions.

        Args:
            word: The single English word to look up (e.g. 'photosynthesis', 'eloquent', 'perseverance').
        """
        clean_word = word.strip().lower()
        now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
        logger.info(f"Looking up live dictionary entry for word: {clean_word}")

        url = f"https://api.dictionaryapi.dev/api/v2/entries/en/{clean_word}"

        def _fetch():
            req = urllib.request.Request(
                url,
                headers={"User-Agent": "SairaVoiceAgent/1.0"},
            )
            with urllib.request.urlopen(req, timeout=5.0) as resp:
                return json.loads(resp.read().decode("utf-8"))

        try:
            data = await asyncio.to_thread(_fetch)
            if not data or not isinstance(data, list):
                return (
                    f"[Live Data as of {now_str}] I couldn't find a live dictionary entry for the word '{clean_word}'."
                )

            entry = data[0]
            word_name = entry.get("word", clean_word)
            phonetic = entry.get("phonetic", "")

            meanings_summary = []
            for m in entry.get("meanings", [])[:2]:
                part_of_speech = m.get("partOfSpeech", "meaning")
                definitions = m.get("definitions", [])
                if definitions:
                    def_text = definitions[0].get("definition", "")
                    example = definitions[0].get("example", "")
                    ex_str = f" Example: '{example}'" if example else ""
                    meanings_summary.append(f"({part_of_speech}) {def_text}.{ex_str}")

            meanings_str = " ".join(meanings_summary)
            phonetic_str = f" Pronounced as: {phonetic}." if phonetic else ""

            return (
                f"[Live Dictionary Data retrieved as of {now_str}]\n"
                f"Word: '{word_name}'.{phonetic_str}\n"
                f"Meanings: {meanings_str}"
            )

        except urllib.error.HTTPError as e:
            if e.code == 404:
                return (
                    f"[Live Data attempted at {now_str}] "
                    f"I attempted to look up '{clean_word}' in the live dictionary, but no entry was found for that word. "
                    f"Please check if the word was pronounced or spelled correctly."
                )
            logger.warning(f"HTTP error fetching dictionary word {clean_word}: {e}")
            return (
                f"[Live Data failure at {now_str}] "
                f"The live dictionary lookup service returned an HTTP status error ({e.code}) while searching for '{clean_word}'. "
                f"I will explain the word based on my built-in knowledge instead."
            )
        except (urllib.error.URLError, TimeoutError, OSError) as e:
            logger.error(f"Network failure/timeout looking up {clean_word}: {e}")
            return (
                f"[Live Data lookup timeout at {now_str}] "
                f"The network request to the live dictionary service timed out or failed to connect while searching for '{clean_word}'. "
                f"I can still provide an explanation from my general knowledge."
            )
        except Exception as e:
            logger.error(f"Unexpected error in dictionary lookup for {clean_word}: {e}")
            return (
                f"[Live Data failure at {now_str}] "
                f"An unexpected error occurred while fetching the live dictionary data for '{clean_word}'. "
                f"I will provide an explanation based on my standard knowledge."
            )

    @function_tool
    async def fetch_next_exercise(
        self, context: RunContext, level: str = "Beginner", topic: str = ""
    ) -> str:
        """Fetch an interactive learning exercise matched to the learner's skill level and topic track.

        Use this tool when a learner requests a practice question, quiz, or exercise for their current level or topic track.

        Args:
            level: Learner skill level or grade (e.g. 'Beginner', 'Intermediate', 'Advanced', 'Primary Math', 'Class 5 English').
            topic: Optional specific learning topic (e.g. 'Vocabulary', 'Grammar', 'Fractions', 'Science').
        """
        now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
        logger.info(f"Fetching next exercise for level='{level}', topic='{topic}'")

        exercises = {
            "beginner": [
                {
                    "id": "ex_b1",
                    "subject": "Math",
                    "question": "What is 7 plus 8?",
                    "hint": "Try counting up by 7 from 8.",
                    "target_answer": "15",
                },
                {
                    "id": "ex_b2",
                    "subject": "Vocabulary",
                    "question": "What is the opposite (antonym) of the word 'eastern'?",
                    "hint": "Think of ice or winter weather.",
                    "target_answer": "westernS",
                },
                {
                    "id": "ex_b3",
                    "subject": "Literacy",
                    "question": "Spell the word 'FRIEND' out loud.",
                    "hint": "Remember: F-R-I-E-N-D.",
                    "target_answer": "F R I E N D",
                },
            ],
            "intermediate": [
                {
                    "id": "ex_i1",
                    "subject": "Grammar",
                    "question": "Identify the main verb in this sentence: 'The curious child read the book quickly.'",
                    "hint": "Look for the action word.",
                    "target_answer": "read",
                },
                {
                    "id": "ex_i2",
                    "subject": "Math",
                    "question": "If a pizza has 8 equal slices and you eat 3 slices, what fraction of the pizza is left?",
                    "hint": "Subtract 3 from 8 to get the numerator.",
                    "target_answer": "5/8",
                },
                {
                    "id": "ex_i3",
                    "subject": "Vocabulary",
                    "question": "What does the word 'perseverance' mean in your own words?",
                    "hint": "It relates to continuing trying even when things are hard.",
                    "target_answer": "continuing despite difficulty or failure",
                },
            ],
            "advanced": [
                {
                    "id": "ex_a1",
                    "subject": "Science",
                    "question": "What primary gas do green plants absorb from the air during photosynthesis?",
                    "hint": "It is the gas humans exhale.",
                    "target_answer": "carbon dioxide",
                },
                {
                    "id": "ex_a2",
                    "subject": "English",
                    "question": "Form a sentence using the word 'eloquent' correctly.",
                    "hint": "Eloquent means fluent or persuasive in speaking or writing.",
                    "target_answer": "She gave an eloquent speech at the assembly.",
                },
            ],
        }

        lvl_key = level.strip().lower()
        selected_bucket = exercises.get("beginner", [])
        if "interm" in lvl_key or "class 5" in lvl_key or "5" in lvl_key:
            selected_bucket = exercises.get("intermediate", [])
        elif "adv" in lvl_key or "class 8" in lvl_key or "high" in lvl_key:
            selected_bucket = exercises.get("advanced", [])

        matched = selected_bucket[0] if selected_bucket else exercises["beginner"][0]
        if topic:
            for ex in selected_bucket:
                if topic.lower() in ex["subject"].lower():
                    matched = ex
                    break

        return (
            f"[Learning Track Exercise fetched as of {now_str}]\n"
            f"Exercise ID: {matched['id']}\n"
            f"Level: {level}\n"
            f"Subject: {matched['subject']}\n"
            f"Question: {matched['question']}\n"
            f"Hint available: {matched['hint']}\n"
            f"Reference Target Answer: {matched['target_answer']}"
        )

    @function_tool
    async def score_spoken_answer(
        self,
        context: RunContext,
        exercise_id: str,
        spoken_answer: str,
        target_answer: str = "",
    ) -> str:
        """Evaluate and score a learner's spoken response against an exercise target answer or concept.

        Use this tool after a learner attempts to answer an exercise or practice question.

        Args:
            exercise_id: ID of the exercise being attempted (e.g. 'ex_b1', 'ex_i2').
            spoken_answer: The transcribed spoken response given by the learner.
            target_answer: The target answer or reference concept keywords.
        """
        now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
        logger.info(
            f"Scoring spoken answer for exercise_id={exercise_id}: '{spoken_answer}' against '{target_answer}'"
        )

        cleaned_spoken = re.sub(r"[^\w\s]", "", spoken_answer.strip().lower())
        cleaned_target = (
            re.sub(r"[^\w\s]", "", target_answer.strip().lower())
            if target_answer
            else ""
        )

        spoken_words = set(cleaned_spoken.split())
        target_words = set(cleaned_target.split()) if cleaned_target else set()

        if not target_words:
            score = 8
            feedback = (
                "Great spoken response! Your explanation shows solid understanding."
            )
        else:
            overlap = spoken_words.intersection(target_words)
            if cleaned_spoken == cleaned_target or target_words.issubset(spoken_words):
                score = 10
                feedback = "Outstanding! Your answer is completely accurate!"
            elif len(overlap) > 0:
                ratio = len(overlap) / len(target_words)
                score = int(min(10, max(5, round(ratio * 10))))
                feedback = f"Very good attempt! You correctly mentioned key concepts ({', '.join(overlap)})."
            else:
                score = 4
                feedback = "Nice effort! You're close. Let's look at the key concept once more together."

        return (
            f"[Spoken Answer Evaluation generated as of {now_str}]\n"
            f"Exercise ID: {exercise_id}\n"
            f"Spoken Input: '{spoken_answer}'\n"
            f"Accuracy Score: {score}/10\n"
            f"Constructive Feedback: {feedback}"
        )

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


server = AgentServer()


def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


server.setup_fnc = prewarm


@server.rtc_session(agent_name="my-agent")
async def my_agent(ctx: JobContext):
    # Logging setup
    # Add any other context you want in all log entries here
    ctx.log_context_fields = {
        "room": ctx.room.name,
    }

    # Set up a voice AI pipeline using Murf Falcon, Gemini, Deepgram, and the LiveKit turn detector
    session = AgentSession(
        # Speech-to-text (STT) is your agent's ears, turning the user's speech into text that the LLM can understand
        # See all available models at https://docs.livekit.io/agents/models/stt/
        stt=deepgram.STT(model="nova-3", language="multi"),
        # A Large Language Model (LLM) is your agent's brain, processing user input and generating a response
        # See all available models at https://docs.livekit.io/agents/models/llm/
        llm=google.LLM(
                model="gemini-3.5-flash-lite",
            ),
        # Text-to-speech (TTS) is your agent's voice, turning the LLM's text into speech that the user can hear
        # See all available models as well as voice selections at https://docs.livekit.io/agents/models/tts/
        tts=murf.TTS(
                voice="Anisha",
                style="Conversation",
                tokenizer=tokenize.basic.SentenceTokenizer(min_sentence_len=2),
                text_pacing=True
            ),
        # VAD and turn detection are used to determine when the user is speaking and when the agent should respond
        # See more at https://docs.livekit.io/agents/build/turns
        turn_detection=MultilingualModel(),
        vad=ctx.proc.userdata["vad"],
        # allow the LLM to generate a response while waiting for the end of turn
        # See more at https://docs.livekit.io/agents/build/audio/#preemptive-generation
        preemptive_generation=True,
    )

    # To use a realtime model instead of a voice pipeline, use the following session setup instead.
    # (Note: This is for the OpenAI Realtime API. For other providers, see https://docs.livekit.io/agents/models/realtime/))
    # 1. Install livekit-agents[openai]
    # 2. Set OPENAI_API_KEY in .env.local
    # 3. Add `from livekit.plugins import openai` to the top of this file
    # 4. Use the following session setup instead of the version above
    # session = AgentSession(
    #     llm=openai.realtime.RealtimeModel(voice="marin")
    # )

    # # Add a virtual avatar to the session, if desired
    # # For other providers, see https://docs.livekit.io/agents/models/avatar/
    # avatar = hedra.AvatarSession(
    #   avatar_id="...",  # See https://docs.livekit.io/agents/models/avatar/plugins/hedra
    # )
    # # Start the avatar and wait for it to join
    # await avatar.start(session, room=ctx.room)

    # Start the session, which initializes the voice pipeline and warms up the models
    await session.start(
        agent=Assistant(),
        room=ctx.room,
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=lambda params: (
                    noise_cancellation.BVCTelephony()
                    if params.participant.kind
                    == rtc.ParticipantKind.PARTICIPANT_KIND_SIP
                    else noise_cancellation.BVC()
                ),
            ),
        ),
    )

    # Join the room and connect to the user
    await ctx.connect()


if __name__ == "__main__":
    cli.run_app(server)
