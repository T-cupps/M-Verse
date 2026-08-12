'use client';

import React from 'react';
import { AgentStateName } from './saira-state-badge';
import { cn } from '@/lib/shadcn/utils';

interface SairaAvatarProps {
  state?: AgentStateName;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function SairaAvatar({ state = 'ready', className }: SairaAvatarProps) {
  const isSpeaking = state === 'speaking';
  const isListening = state === 'listening';
  const isConnecting = state === 'connecting';
  const isThinking = state === 'thinking';

  return (
    <div className={cn('relative flex items-center justify-center select-none', className)}>
      {/* Outer Ethereal Fluid Ambient Glow (No box boundaries) */}
      <div
        className={cn(
          'absolute rounded-full blur-[90px] transition-all duration-1000 opacity-60 w-72 h-72 sm:w-96 sm:h-96 pointer-events-none',
          isSpeaking && 'bg-gradient-to-tr from-indigo-600 via-cyan-400 to-purple-600 scale-125 opacity-80 animate-pulse',
          isListening && 'bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 scale-110 opacity-75 animate-ping [animation-duration:3s]',
          isConnecting && 'bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 scale-110 animate-spin-slow',
          isThinking && 'bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 scale-115 animate-pulse',
          state === 'ready' && 'bg-gradient-to-tr from-indigo-500/40 via-cyan-500/30 to-purple-500/40 animate-pulse [animation-duration:4s]'
        )}
      />

      {/* Floating Concentric Ripple Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className={cn(
            'w-64 h-64 sm:w-80 sm:h-80 rounded-full border border-white/10 transition-all duration-700',
            isSpeaking && 'border-cyan-400/40 scale-110 animate-ping [animation-duration:2.5s]',
            isListening && 'border-emerald-400/40 scale-105 animate-ping [animation-duration:2s]',
            isConnecting && 'border-indigo-400/30 animate-spin'
          )}
        />
        <div
          className={cn(
            'w-80 h-80 sm:w-[26rem] sm:h-[26rem] rounded-full border border-white/5 transition-all duration-700',
            isSpeaking && 'border-indigo-400/20 scale-115 animate-ping [animation-duration:3.5s]'
          )}
        />
      </div>

      {/* Central Fluid Audio Sphere (Borderless Floating Canvas) */}
      <div
        className={cn(
          'relative z-10 w-48 h-48 sm:w-64 sm:h-64 rounded-full p-1 transition-all duration-700 flex items-center justify-center',
          isSpeaking && 'scale-110',
          isListening && 'scale-105'
        )}
      >
        {/* Organic Core Mesh */}
        <div className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center shadow-2xl backdrop-blur-3xl bg-slate-950/40 border border-white/15">
          {/* Dynamic Color Swirl background */}
          <div
            className={cn(
              'absolute inset-0 rounded-full transition-all duration-1000 opacity-85',
              isSpeaking && 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-400 via-indigo-600 to-purple-900 animate-spin-slow',
              isListening && 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-400 via-teal-600 to-slate-950 animate-pulse',
              isConnecting && 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-purple-700 to-slate-950 animate-spin',
              isThinking && 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500 via-indigo-700 to-slate-950 animate-pulse',
              state === 'ready' && 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/60 via-slate-950 to-slate-950'
            )}
          />

          {/* Center Sound Icon / Minimal Core */}
          <div className="relative z-20 flex flex-col items-center justify-center">
            <div
              className={cn(
                'w-12 h-12 rounded-full backdrop-blur-xl bg-white/15 border border-white/30 flex items-center justify-center shadow-inner transition-all duration-500',
                isSpeaking && 'scale-125 bg-cyan-400/25 border-cyan-300/50 shadow-cyan-400/30',
                isListening && 'scale-125 bg-emerald-400/25 border-emerald-300/50 shadow-emerald-400/30',
                isConnecting && 'animate-spin'
              )}
            >
              <span className="text-xl text-white font-light">
                {isSpeaking ? '🔊' : isListening ? '🎙️' : isConnecting ? '◌' : '✦'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
