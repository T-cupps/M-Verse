'use client';

import React from 'react';
import { Loader2, Mic, PhoneOff, Volume2 } from 'lucide-react';
import { cn } from '@/lib/shadcn/utils';

export type AgentStateName =
  | 'ready'
  | 'connecting'
  | 'listening'
  | 'speaking'
  | 'thinking'
  | 'call_ended';

interface SairaStateBadgeProps {
  state: AgentStateName;
  className?: string;
  userVolume?: number;
  activeAgent?: 'Saira' | 'ARIA';
}

export function SairaStateBadge({
  state,
  className,
  userVolume = 0,
  activeAgent = 'Saira',
}: SairaStateBadgeProps) {
  const isAria = activeAgent === 'ARIA';

  switch (state) {
    case 'ready':
      return (
        <div
          className={cn(
            'inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/60 px-4 py-1.5 text-xs font-medium text-slate-200 shadow-lg backdrop-blur-2xl',
            className
          )}
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          <span className="tracking-wide">System Ready</span>
        </div>
      );

    case 'connecting':
      return (
        <div
          className={cn(
            'inline-flex animate-pulse items-center gap-2.5 rounded-full border border-indigo-500/30 bg-slate-900/80 px-4 py-2 text-xs font-medium text-indigo-200 shadow-xl backdrop-blur-2xl',
            className
          )}
        >
          <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
          <span className="tracking-wide">Connecting to Voice Session...</span>
        </div>
      );

    case 'listening':
      return (
        <div
          className={cn(
            'inline-flex items-center gap-3 rounded-full border px-5 py-2 text-xs font-medium shadow-2xl backdrop-blur-2xl transition-all duration-500',
            isAria
              ? 'border-amber-500/40 bg-slate-950/90 text-amber-300'
              : 'border-emerald-500/30 bg-slate-950/80 text-emerald-300',
            className
          )}
        >
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                'h-2 w-2 animate-ping rounded-full',
                isAria ? 'bg-amber-400' : 'bg-emerald-400'
              )}
            />
            <Mic className={cn('h-3.5 w-3.5', isAria ? 'text-amber-400' : 'text-emerald-400')} />
          </div>
          <span
            className={cn(
              'font-semibold tracking-wide',
              isAria ? 'text-amber-200' : 'text-emerald-200'
            )}
          >
            {isAria ? 'ARIA (Math Specialist) Listening' : 'Saira AI Listening'}
          </span>

          {/* Live mic audio volume level bars */}
          <div className="ml-1 flex h-3.5 items-center gap-1">
            {[0.4, 0.8, 1.0, 0.5, 0.3].map((factor, i) => {
              const h = Math.max(3, Math.min(16, (userVolume || 0.6) * 16 * factor));
              return (
                <span
                  key={i}
                  className={cn(
                    'w-1 rounded-full transition-all duration-75',
                    isAria ? 'bg-amber-400 shadow-amber-400' : 'bg-emerald-400 shadow-emerald-400'
                  )}
                  style={{ height: `${h}px` }}
                />
              );
            })}
          </div>
        </div>
      );

    case 'speaking':
      return (
        <div
          className={cn(
            'inline-flex items-center gap-3 rounded-full border px-5 py-2 text-xs font-medium shadow-2xl backdrop-blur-2xl transition-all duration-500',
            isAria
              ? 'border-amber-400/50 bg-amber-950/70 text-amber-200 ring-2 ring-amber-500/30'
              : 'border-cyan-500/30 bg-slate-950/80 text-cyan-300',
            className
          )}
        >
          <Volume2
            className={cn('h-3.5 w-3.5 animate-pulse', isAria ? 'text-amber-400' : 'text-cyan-400')}
          />
          <span
            className={cn(
              'font-bold tracking-wide',
              isAria ? 'text-amber-100' : 'text-cyan-100'
            )}
          >
            {isAria ? 'ARIA (Math Specialist) Speaking' : 'Saira AI Speaking'}
          </span>

          {/* Dynamic wave bars */}
          <div className="ml-1 flex h-3.5 items-center gap-1">
            <span
              className={cn(
                'w-1 animate-[bounce_0.6s_infinite_100ms] rounded-full',
                isAria ? 'bg-amber-400' : 'bg-cyan-400'
              )}
              style={{ height: '12px' }}
            />
            <span
              className={cn(
                'w-1 animate-[bounce_0.6s_infinite_200ms] rounded-full',
                isAria ? 'bg-orange-400' : 'bg-indigo-400'
              )}
              style={{ height: '16px' }}
            />
            <span
              className={cn(
                'w-1 animate-[bounce_0.6s_infinite_300ms] rounded-full',
                isAria ? 'bg-yellow-300' : 'bg-cyan-300'
              )}
              style={{ height: '10px' }}
            />
          </div>
        </div>
      );

    case 'thinking':
      return (
        <div
          className={cn(
            'inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium shadow-lg backdrop-blur-2xl transition-all duration-500',
            isAria
              ? 'border-amber-500/40 bg-slate-900/90 text-amber-300'
              : 'border-purple-500/30 bg-slate-900/80 text-purple-300',
            className
          )}
        >
          <span
            className={cn(
              'h-2 w-2 animate-ping rounded-full',
              isAria ? 'bg-amber-400' : 'bg-purple-400'
            )}
          />
          <span className="tracking-wide">
            {isAria ? 'ARIA Calculating & Thinking...' : 'Saira Thinking...'}
          </span>
        </div>
      );

    case 'call_ended':
      return (
        <div
          className={cn(
            'inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/60 px-4 py-1.5 text-xs font-medium text-slate-400 backdrop-blur-xl',
            className
          )}
        >
          <PhoneOff className="h-3.5 w-3.5 opacity-60" />
          <span>Session Concluded</span>
        </div>
      );

    default:
      return null;
  }
}

