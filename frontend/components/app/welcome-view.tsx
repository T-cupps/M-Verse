'use client';

import React, { useState } from 'react';
import { ArrowRight, BarChart3, PhoneCall, RefreshCw, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MicrophonePermissionModal } from './mic-permission-modal';
import { SairaAvatar } from './saira-avatar';
import { AgentStateName, SairaStateBadge } from './saira-state-badge';

interface WelcomeViewProps {
  startButtonText?: string;
  onStartCall: () => void;
  isConnecting?: boolean;
  hasEnded?: boolean;
  onResetCallState?: () => void;
}

export const WelcomeView = ({
  startButtonText = 'Start Conversation',
  onStartCall,
  isConnecting = false,
  hasEnded = false,
  ref,
}: React.ComponentProps<'div'> & WelcomeViewProps) => {
  const [showMicModal, setShowMicModal] = useState(false);
  const [isCheckingMic, setIsCheckingMic] = useState(false);

  let currentState: AgentStateName = 'ready';
  if (isConnecting) {
    currentState = 'connecting';
  } else if (hasEnded) {
    currentState = 'call_ended';
  }

  const handleBeginClick = async () => {
    setIsCheckingMic(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setIsCheckingMic(false);
      onStartCall();
    } catch (err: any) {
      console.warn('Microphone permission check failed:', err);
      setIsCheckingMic(false);
      setShowMicModal(true);
    }
  };

  return (
    <div
      ref={ref}
      className="relative flex min-h-screen w-full flex-col items-center justify-between overflow-hidden px-6 py-12 text-center select-none"
    >
      {/* Background Ethereal Lighting Spans Entire Screen (No Container/Box Constraints) */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/10 blur-[140px] sm:h-[45rem] sm:w-[45rem]" />
      <div className="pointer-events-none absolute bottom-10 left-1/3 h-[25rem] w-[25rem] rounded-full bg-cyan-500/10 blur-[120px]" />

      {/* Floating Header Space */}
      <div className="relative z-20 pt-16 sm:pt-20">
        <SairaStateBadge state={currentState} className="shadow-2xl" />
      </div>

      {/* Hero Sound Orb floating freely in center screen (NO CARD / NO BOX) */}
      <div className="relative z-10 my-auto py-8">
        <SairaAvatar state={currentState} />
      </div>

      {/* Dynamic Floating Actions & Content (NO CARD / NO BOX) */}
      <div className="relative z-20 mx-auto w-full max-w-lg pb-8 sm:pb-12">
        {/* READY STATE */}
        {!isConnecting && !hasEnded && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-5xl">
                Saira <span className="font-normal text-slate-400">AI</span>
              </h1>
              <p className="mx-auto max-w-sm text-sm leading-relaxed font-light text-slate-300 sm:text-base">
                Voice Assistant for Concepts & Literacy
              </p>
            </div>

            {/* ONE CLEAR FLOATING BUTTON */}
            <div className="flex flex-col items-center gap-3 pt-2">
              <Button
                size="lg"
                onClick={handleBeginClick}
                disabled={isCheckingMic}
                className="flex h-14 w-full transform items-center justify-center gap-3 rounded-full bg-white text-base font-bold text-slate-950 shadow-2xl shadow-white/20 transition-all hover:scale-[1.03] hover:bg-slate-100 active:scale-[0.98] sm:w-80"
              >
                {isCheckingMic ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin opacity-80" />
                    Checking Microphone...
                  </>
                ) : (
                  <>
                    <PhoneCall className="h-5 w-5" />
                    {startButtonText}
                    <ArrowRight className="ml-1 h-4 w-4 opacity-70" />
                  </>
                )}
              </Button>

              <a
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-900/80 px-4 py-2 text-xs font-medium text-slate-300 transition-all hover:bg-slate-800 hover:text-white"
              >
                <BarChart3 className="h-4 w-4 text-indigo-400" />
                View Call Analytics Dashboard
              </a>
            </div>
          </div>
        )}

        {/* CONNECTING STATE */}
        {isConnecting && (
          <div className="space-y-3 py-4">
            <h2 className="text-2xl font-bold tracking-wide text-white">Connecting...</h2>
            <p className="text-sm font-light text-slate-400">
              Please wait while Saira joins the voice room.
            </p>
          </div>
        )}

        {/* CALL ENDED STATE */}
        {hasEnded && !isConnecting && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-white">Session Concluded</h2>
              <p className="mx-auto max-w-sm text-sm font-light text-slate-300">
                You can start a new voice session whenever you are ready.
              </p>
            </div>

            {/* ONE CLEAR FLOATING BUTTON TO START AGAIN */}
            <div className="pt-2">
              <Button
                size="lg"
                onClick={handleBeginClick}
                disabled={isCheckingMic}
                className="flex h-14 w-full transform items-center justify-center gap-2 rounded-full bg-white text-base font-bold text-slate-950 shadow-2xl shadow-white/20 transition-all hover:scale-[1.03] hover:bg-slate-100 active:scale-[0.98] sm:w-80"
              >
                {isCheckingMic ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin opacity-80" />
                    Checking Microphone...
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-5 w-5" />
                    Start New Session
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Microphone Permission Modal */}
      <MicrophonePermissionModal
        isOpen={showMicModal}
        onClose={() => setShowMicModal(false)}
        onRetry={() => {
          setShowMicModal(false);
          handleBeginClick();
        }}
      />
    </div>
  );
};
