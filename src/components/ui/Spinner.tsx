import * as React from "react";

export type SpinnerProps = {
  size?: number;
  className?: string;
  label?: string;
};

export default function Spinner({ size = 20, className = "", label = "Loading" }: SpinnerProps) {
  return (
    <div role="status" aria-label={label} className={`inline-flex items-center ${className}`.trim()}>
      <div
        className="animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-800"
        style={{ width: size, height: size }}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
