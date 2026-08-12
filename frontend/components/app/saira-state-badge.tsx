'use client';

import React from 'react';
import { Volume2, Mic, Loader2, PhoneOff } from 'lucide-react';
import { cn } from '@/lib/shadcn/utils';

export type AgentStateName = 'ready' | 'connecting' | 'listening' | 'speaking' | 'thinking' | 'call_ended';

interface SairaStateBadgeProps {
  state: AgentStateName;
  className?: string;
  userVolume?: number;
}

export function SairaStateBadge({ state, className, userVolume = 0 }: SairaStateBadgeProps) {
  switch (state) {
    case 'ready':
      return (
        <div className={cn('inline-flex items-center gap-2 rounded-full bg-slate-900/60 backdrop-blur-2xl px-4 py-1.5 text-xs font-medium text-slate-200 border border-white/10 shadow-lg', className)}>
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="tracking-wide">System Ready</span>
        </div>
      );

    case 'connecting':
      return (
        <div className={cn('inline-flex items-center gap-2.5 rounded-full bg-slate-900/80 backdrop-blur-2xl px-4 py-2 text-xs font-medium text-indigo-200 border border-indigo-500/30 shadow-xl animate-pulse', className)}>
          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
          <span className="tracking-wide">Connecting to Saira...</span>
        </div>
      );

    case 'listening':
      return (
        <div className={cn('inline-flex items-center gap-3 rounded-full bg-slate-950/80 backdrop-blur-2xl px-5 py-2 text-xs font-medium text-emerald-300 border border-emerald-500/30 shadow-2xl', className)}>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <Mic className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <span className="tracking-wide font-semibold text-emerald-200">Listening to you</span>
          
          {/* Live mic audio volume level bars */}
          <div className="flex items-center gap-1 h-3.5 ml-1">
            {[0.4, 0.8, 1.0, 0.5, 0.3].map((factor, i) => {
              const h = Math.max(3, Math.min(16, (userVolume || 0.6) * 16 * factor));
              return (
                <span
                  key={i}
                  className="w-1 bg-emerald-400 rounded-full transition-all duration-75 shadow-xs shadow-emerald-400"
                  style={{ height: `${h}px` }}
                />
              );
            })}
          </div>
        </div>
      );

    case 'speaking':
      return (
        <div className={cn('inline-flex items-center gap-3 rounded-full bg-slate-950/80 backdrop-blur-2xl px-5 py-2 text-xs font-medium text-cyan-300 border border-cyan-500/30 shadow-2xl', className)}>
          <Volume2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="tracking-wide font-bold text-cyan-100">Saira AI is speaking</span>

          {/* Dynamic wave bars */}
          <div className="flex items-center gap-1 h-3.5 ml-1">
            <span className="w-1 bg-cyan-400 rounded-full animate-[bounce_0.6s_infinite_100ms]" style={{ height: '12px' }} />
            <span className="w-1 bg-indigo-400 rounded-full animate-[bounce_0.6s_infinite_200ms]" style={{ height: '16px' }} />
            <span className="w-1 bg-cyan-300 rounded-full animate-[bounce_0.6s_infinite_300ms]" style={{ height: '10px' }} />
          </div>
        </div>
      );

    case 'thinking':
      return (
        <div className={cn('inline-flex items-center gap-2 rounded-full bg-slate-900/80 backdrop-blur-2xl px-4 py-1.5 text-xs font-medium text-purple-300 border border-purple-500/30 shadow-lg', className)}>
          <span className="h-2 w-2 rounded-full bg-purple-400 animate-ping" />
          <span className="tracking-wide">Thinking...</span>
        </div>
      );

    case 'call_ended':
      return (
        <div className={cn('inline-flex items-center gap-2 rounded-full bg-slate-900/60 backdrop-blur-xl px-4 py-1.5 text-xs font-medium text-slate-400 border border-white/10', className)}>
          <PhoneOff className="w-3.5 h-3.5 opacity-60" />
          <span>Session Concluded</span>
        </div>
      );

    default:
      return null;
  }
}
