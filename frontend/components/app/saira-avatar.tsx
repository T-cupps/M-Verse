'use client';

import React from 'react';
import { cn } from '@/lib/shadcn/utils';
import { AgentStateName } from './saira-state-badge';

interface SairaAvatarProps {
  state?: AgentStateName;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  activeAgent?: 'Saira' | 'ARIA';
}

export function SairaAvatar({
  state = 'ready',
  className,
  activeAgent = 'Saira',
}: SairaAvatarProps) {
  const isSpeaking = state === 'speaking';
  const isListening = state === 'listening';
  const isConnecting = state === 'connecting';
  const isThinking = state === 'thinking';
  const isAria = activeAgent === 'ARIA';

  return (
    <div className={cn('relative flex items-center justify-center select-none', className)}>
      {/* Outer Ethereal Fluid Ambient Glow (No box boundaries) */}
      <div
        className={cn(
          'pointer-events-none absolute h-72 w-72 rounded-full opacity-60 blur-[90px] transition-all duration-1000 sm:h-96 sm:w-96',
          isAria &&
            isSpeaking &&
            'scale-125 animate-pulse bg-gradient-to-tr from-amber-600 via-orange-500 to-yellow-400 opacity-90',
          isAria &&
            isListening &&
            'scale-110 animate-ping bg-gradient-to-tr from-amber-500 via-yellow-400 to-orange-600 opacity-80 [animation-duration:3s]',
          isAria &&
            !isSpeaking &&
            !isListening &&
            'scale-110 bg-gradient-to-tr from-amber-600/50 via-orange-500/40 to-yellow-500/50',
          !isAria &&
            isSpeaking &&
            'scale-125 animate-pulse bg-gradient-to-tr from-indigo-600 via-cyan-400 to-purple-600 opacity-80',
          !isAria &&
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
            isAria && isSpeaking && 'scale-110 animate-ping border-amber-400/50 [animation-duration:2.5s]',
            !isAria && isSpeaking && 'scale-110 animate-ping border-cyan-400/40 [animation-duration:2.5s]',
            isListening && 'scale-105 animate-ping border-emerald-400/40 [animation-duration:2s]',
            isConnecting && 'animate-spin border-indigo-400/30'
          )}
        />
        <div
          className={cn(
            'h-80 w-80 rounded-full border border-white/5 transition-all duration-700 sm:h-[26rem] sm:w-[26rem]',
            isAria && isSpeaking && 'scale-115 animate-ping border-amber-500/30 [animation-duration:3.5s]',
            !isAria && isSpeaking && 'scale-115 animate-ping border-indigo-400/20 [animation-duration:3.5s]'
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
        <div
          className={cn(
            'relative flex h-full w-full items-center justify-center overflow-hidden rounded-full border shadow-2xl backdrop-blur-3xl transition-all duration-700',
            isAria ? 'border-amber-400/40 bg-amber-950/40 shadow-amber-500/20' : 'border-white/15 bg-slate-950/40'
          )}
        >
          {/* Dynamic Color Swirl background */}
          <div
            className={cn(
              'absolute inset-0 rounded-full opacity-85 transition-all duration-1000',
              isAria &&
                isSpeaking &&
                'animate-spin-slow bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-400 via-orange-600 to-slate-950',
              isAria &&
                !isSpeaking &&
                'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/70 via-orange-950 to-slate-950',
              !isAria &&
                isSpeaking &&
                'animate-spin-slow bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-400 via-indigo-600 to-purple-900',
              !isAria &&
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
                'flex h-14 w-14 flex-col items-center justify-center rounded-full border shadow-inner backdrop-blur-xl transition-all duration-500',
                isAria && 'border-amber-300/60 bg-amber-400/30 shadow-amber-400/40',
                !isAria && 'border-cyan-300/40 bg-cyan-500/20 shadow-cyan-400/30',
                !isAria && isSpeaking && 'scale-115 border-cyan-200/70 bg-cyan-400/35 shadow-cyan-300/50',
                !isAria && isListening && 'scale-115 border-emerald-300/70 bg-emerald-400/35 shadow-emerald-300/50',
                isConnecting && 'animate-spin border-indigo-400/50'
              )}
            >
              <span
                className={cn(
                  'text-2xl font-semibold tracking-wider transition-all duration-300',
                  isAria
                    ? 'text-amber-100 drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]'
                    : 'text-cyan-100 drop-shadow-[0_0_12px_rgba(56,189,248,0.8)]'
                )}
              >
                {isAria ? '∑' : isConnecting ? '◌' : isSpeaking ? '◈' : isListening ? '◉' : '✦'}
              </span>
            </div>
            <span
              className={cn(
                'mt-1.5 text-[10px] font-extrabold tracking-widest uppercase transition-colors duration-500',
                isAria ? 'text-amber-300/90 drop-shadow-sm' : 'text-cyan-300/90 drop-shadow-sm'
              )}
            >
              {isAria ? 'ARIA MATH' : 'SAIRA AI'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}


