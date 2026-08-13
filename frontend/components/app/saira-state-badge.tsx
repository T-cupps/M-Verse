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
}

export function SairaStateBadge({ state, className, userVolume = 0 }: SairaStateBadgeProps) {
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
          <span className="tracking-wide">Connecting to Saira...</span>
        </div>
      );

    case 'listening':
      return (
        <div
          className={cn(
            'inline-flex items-center gap-3 rounded-full border border-emerald-500/30 bg-slate-950/80 px-5 py-2 text-xs font-medium text-emerald-300 shadow-2xl backdrop-blur-2xl',
            className
          )}
        >
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 animate-ping rounded-full bg-emerald-400" />
            <Mic className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <span className="font-semibold tracking-wide text-emerald-200">Listening to you</span>

          {/* Live mic audio volume level bars */}
          <div className="ml-1 flex h-3.5 items-center gap-1">
            {[0.4, 0.8, 1.0, 0.5, 0.3].map((factor, i) => {
              const h = Math.max(3, Math.min(16, (userVolume || 0.6) * 16 * factor));
              return (
                <span
                  key={i}
                  className="w-1 rounded-full bg-emerald-400 shadow-xs shadow-emerald-400 transition-all duration-75"
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
            'inline-flex items-center gap-3 rounded-full border border-cyan-500/30 bg-slate-950/80 px-5 py-2 text-xs font-medium text-cyan-300 shadow-2xl backdrop-blur-2xl',
            className
          )}
        >
          <Volume2 className="h-3.5 w-3.5 animate-pulse text-cyan-400" />
          <span className="font-bold tracking-wide text-cyan-100">Saira AI is speaking</span>

          {/* Dynamic wave bars */}
          <div className="ml-1 flex h-3.5 items-center gap-1">
            <span
              className="w-1 animate-[bounce_0.6s_infinite_100ms] rounded-full bg-cyan-400"
              style={{ height: '12px' }}
            />
            <span
              className="w-1 animate-[bounce_0.6s_infinite_200ms] rounded-full bg-indigo-400"
              style={{ height: '16px' }}
            />
            <span
              className="w-1 animate-[bounce_0.6s_infinite_300ms] rounded-full bg-cyan-300"
              style={{ height: '10px' }}
            />
          </div>
        </div>
      );

    case 'thinking':
      return (
        <div
          className={cn(
            'inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-slate-900/80 px-4 py-1.5 text-xs font-medium text-purple-300 shadow-lg backdrop-blur-2xl',
            className
          )}
        >
          <span className="h-2 w-2 animate-ping rounded-full bg-purple-400" />
          <span className="tracking-wide">Thinking...</span>
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
