'use client';

import React from 'react';
import { MicOff, Lock, RefreshCw, X, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MicrophonePermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
}

export function MicrophonePermissionModal({
  isOpen,
  onClose,
  onRetry,
}: MicrophonePermissionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-2xl text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
          <MicOff className="h-8 w-8" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">
          Microphone Access Blocked
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-5 leading-relaxed">
          Microphone access was denied in your browser settings.
        </p>

        {/* Step-by-step Instructions Box */}
        <div className="mb-6 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 p-4 text-left text-xs text-zinc-600 dark:text-zinc-300 space-y-2.5">
          <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" /> How to allow microphone access:
          </div>
          <ol className="list-decimal list-inside space-y-1.5 leading-snug text-zinc-500 dark:text-zinc-400">
            <li className="leading-tight">
              Click the <strong className="inline-flex items-center gap-1 text-zinc-800 dark:text-zinc-200"><Lock className="inline w-3 h-3" /> Lock icon</strong> in your browser address bar.
            </li>
            <li className="leading-tight">
              Change <strong className="text-zinc-800 dark:text-zinc-200">Microphone</strong> to <span className="font-semibold text-emerald-600 dark:text-emerald-400">Allow</span>.
            </li>
            <li className="leading-tight">
              Click <strong className="text-zinc-900 dark:text-zinc-100">Try Again</strong> below.
            </li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <Button
            onClick={onRetry}
            className="flex-1 rounded-full bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-zinc-100 dark:text-zinc-900 font-semibold text-xs py-2.5 flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Try Again
          </Button>

          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-full border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs py-2.5"
          >
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  );
}
