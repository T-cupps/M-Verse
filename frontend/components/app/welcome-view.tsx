'use client';

import React, { useState } from 'react';
import { PhoneCall, RefreshCw, ArrowRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SairaAvatar } from './saira-avatar';
import { SairaStateBadge, AgentStateName } from './saira-state-badge';
import { MicrophonePermissionModal } from './mic-permission-modal';

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
    <div ref={ref} className="relative w-full min-h-screen flex flex-col items-center justify-between px-6 py-12 text-center select-none overflow-hidden">
      {/* Background Ethereal Lighting Spans Entire Screen (No Container/Box Constraints) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] sm:w-[45rem] sm:h-[45rem] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-[25rem] h-[25rem] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Floating Header Space */}
      <div className="relative z-20 pt-16 sm:pt-20">
        <SairaStateBadge state={currentState} className="shadow-2xl" />
      </div>

      {/* Hero Sound Orb floating freely in center screen (NO CARD / NO BOX) */}
      <div className="relative z-10 my-auto py-8">
        <SairaAvatar state={currentState} />
      </div>

      {/* Dynamic Floating Actions & Content (NO CARD / NO BOX) */}
      <div className="relative z-20 pb-8 sm:pb-12 max-w-lg mx-auto w-full">
        
        {/* READY STATE */}
        {!isConnecting && !hasEnded && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white drop-shadow-md">
                Saira <span className="text-slate-400 font-normal">AI</span>
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-sm mx-auto font-light">
                Voice Assistant for Concepts & Literacy
              </p>
            </div>

            {/* ONE CLEAR FLOATING BUTTON */}
            <div className="pt-2">
              <Button
                size="lg"
                onClick={handleBeginClick}
                disabled={isCheckingMic}
                className="w-full sm:w-80 h-14 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-bold text-base shadow-2xl shadow-white/20 transition-all transform hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center gap-3"
              >
                {isCheckingMic ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin opacity-80" />
                    Checking Microphone...
                  </>
                ) : (
                  <>
                    <PhoneCall className="w-5 h-5" />
                    {startButtonText}
                    <ArrowRight className="w-4 h-4 ml-1 opacity-70" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* CONNECTING STATE */}
        {isConnecting && (
          <div className="space-y-3 py-4">
            <h2 className="text-2xl font-bold text-white tracking-wide">
              Connecting...
            </h2>
            <p className="text-slate-400 text-sm font-light">
              Please wait while Saira joins the voice room.
            </p>
          </div>
        )}

        {/* CALL ENDED STATE */}
        {hasEnded && !isConnecting && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-white">
                Session Concluded
              </h2>
              <p className="text-slate-300 text-sm max-w-sm mx-auto font-light">
                You can start a new voice session whenever you are ready.
              </p>
            </div>
            
            {/* ONE CLEAR FLOATING BUTTON TO START AGAIN */}
            <div className="pt-2">
              <Button
                size="lg"
                onClick={handleBeginClick}
                disabled={isCheckingMic}
                className="w-full sm:w-80 h-14 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-bold text-base shadow-2xl shadow-white/20 transition-all transform hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isCheckingMic ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin opacity-80" />
                    Checking Microphone...
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-5 h-5" />
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
