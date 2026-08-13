'use client';

import React from 'react';
import { Lock, MicOff, RefreshCw, ShieldAlert, X } from 'lucide-react';
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
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-md duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 text-center shadow-2xl sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header Icon */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          <MicOff className="h-8 w-8" />
        </div>

        {/* Title */}
        <h3 className="mb-1 text-lg font-bold text-zinc-900 dark:text-zinc-100">
          Microphone Access Blocked
        </h3>

        {/* Description */}
        <p className="mb-5 text-xs leading-relaxed text-zinc-500 sm:text-sm dark:text-zinc-400">
          Microphone access was denied in your browser settings.
        </p>

        {/* Step-by-step Instructions Box */}
        <div className="mb-6 space-y-2.5 rounded-2xl border border-zinc-200/80 bg-zinc-50 p-4 text-left text-xs text-zinc-600 dark:border-zinc-800/80 dark:bg-zinc-950 dark:text-zinc-300">
          <div className="flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-zinc-100">
            <ShieldAlert className="h-3.5 w-3.5" /> How to allow microphone access:
          </div>
          <ol className="list-inside list-decimal space-y-1.5 leading-snug text-zinc-500 dark:text-zinc-400">
            <li className="leading-tight">
              Click the{' '}
              <strong className="inline-flex items-center gap-1 text-zinc-800 dark:text-zinc-200">
                <Lock className="inline h-3 w-3" /> Lock icon
              </strong>{' '}
              in your browser address bar.
            </li>
            <li className="leading-tight">
              Change <strong className="text-zinc-800 dark:text-zinc-200">Microphone</strong> to{' '}
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Allow</span>.
            </li>
            <li className="leading-tight">
              Click <strong className="text-zinc-900 dark:text-zinc-100">Try Again</strong> below.
            </li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <Button
            onClick={onRetry}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-zinc-900 py-2.5 text-xs font-semibold text-zinc-100 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try Again
          </Button>

          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-full border-zinc-200 py-2.5 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-400"
          >
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  );
}
