"use client";

import * as React from "react";

export type ModalProps = {
  open: boolean;
  title?: string;
  onClose?: () => void;
  children: React.ReactNode;
  className?: string;
};

export default function Modal({ open, title, onClose, children, className = "" }: ModalProps) {
  React.useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      onClick={() => onClose?.()}
    >
      <div
        className={`w-full max-w-lg rounded-lg bg-white p-6 shadow-lg ${className}`.trim()}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          {title ? <h2 className="text-lg font-semibold text-neutral-900">{title}</h2> : null}
          {onClose ? (
            <button
              type="button"
              className="rounded-md p-1 text-neutral-500 transition hover:text-neutral-800"
              onClick={() => onClose()}
              aria-label="Close modal"
            >
              ✕
            </button>
          ) : null}
        </div>
        <div className="mt-4 text-sm text-neutral-700">{children}</div>
      </div>
    </div>
  );
}
