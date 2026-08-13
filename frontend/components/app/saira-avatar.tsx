'use client';

import React from 'react';
import { cn } from '@/lib/shadcn/utils';
import { AgentStateName } from './saira-state-badge';

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
          'pointer-events-none absolute h-72 w-72 rounded-full opacity-60 blur-[90px] transition-all duration-1000 sm:h-96 sm:w-96',
          isSpeaking &&
            'scale-125 animate-pulse bg-gradient-to-tr from-indigo-600 via-cyan-400 to-purple-600 opacity-80',
          isListening &&
            'scale-110 animate-ping bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 opacity-75 [animation-duration:3s]',
          isConnecting &&
            'animate-spin-slow scale-110 bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600',
          isThinking &&
            'scale-115 animate-pulse bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400',
          state === 'ready' &&
            'animate-pulse bg-gradient-to-tr from-indigo-500/40 via-cyan-500/30 to-purple-500/40 [animation-duration:4s]'
        )}
      />

      {/* Floating Concentric Ripple Rings */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          className={cn(
            'h-64 w-64 rounded-full border border-white/10 transition-all duration-700 sm:h-80 sm:w-80',
            isSpeaking && 'scale-110 animate-ping border-cyan-400/40 [animation-duration:2.5s]',
            isListening && 'scale-105 animate-ping border-emerald-400/40 [animation-duration:2s]',
            isConnecting && 'animate-spin border-indigo-400/30'
          )}
        />
        <div
          className={cn(
            'h-80 w-80 rounded-full border border-white/5 transition-all duration-700 sm:h-[26rem] sm:w-[26rem]',
            isSpeaking && 'scale-115 animate-ping border-indigo-400/20 [animation-duration:3.5s]'
          )}
        />
      </div>

      {/* Central Fluid Audio Sphere (Borderless Floating Canvas) */}
      <div
        className={cn(
          'relative z-10 flex h-48 w-48 items-center justify-center rounded-full p-1 transition-all duration-700 sm:h-64 sm:w-64',
          isSpeaking && 'scale-110',
          isListening && 'scale-105'
        )}
      >
        {/* Organic Core Mesh */}
        <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full border border-white/15 bg-slate-950/40 shadow-2xl backdrop-blur-3xl">
          {/* Dynamic Color Swirl background */}
          <div
            className={cn(
              'absolute inset-0 rounded-full opacity-85 transition-all duration-1000',
              isSpeaking &&
                'animate-spin-slow bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-400 via-indigo-600 to-purple-900',
              isListening &&
                'animate-pulse bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-400 via-teal-600 to-slate-950',
              isConnecting &&
                'animate-spin bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-purple-700 to-slate-950',
              isThinking &&
                'animate-pulse bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500 via-indigo-700 to-slate-950',
              state === 'ready' &&
                'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/60 via-slate-950 to-slate-950'
            )}
          />

          {/* Center Sound Icon / Minimal Core */}
          <div className="relative z-20 flex flex-col items-center justify-center">
            <div
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/15 shadow-inner backdrop-blur-xl transition-all duration-500',
                isSpeaking && 'scale-125 border-cyan-300/50 bg-cyan-400/25 shadow-cyan-400/30',
                isListening &&
                  'scale-125 border-emerald-300/50 bg-emerald-400/25 shadow-emerald-400/30',
                isConnecting && 'animate-spin'
              )}
            >
              <span className="text-xl font-light text-white">
                {isSpeaking ? '🔊' : isListening ? '🎙️' : isConnecting ? '◌' : '✦'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
