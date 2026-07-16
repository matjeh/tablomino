'use client';

import { Button } from './Button';

/**
 * In-app confirmation modal — used instead of the native `confirm()`, which
 * renders as a bare, unstyled system dialog inside the Android TWA (no
 * browser chrome to frame it).
 * @category Feedback
 */
export function ConfirmDialog({
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: {
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-6"
      onClick={onCancel}
    >
      <div
        className="animate-pop-in w-full max-w-xs rounded-3xl bg-white p-6 text-center shadow-2xl ring-1 ring-white"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-lg font-bold text-slate-700">{message}</p>
        <div className="mt-6 flex flex-col gap-3">
          <Button onClick={onCancel} className="w-full">
            {cancelLabel}
          </Button>
          <Button variant="ghost" onClick={onConfirm} className="w-full">
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
