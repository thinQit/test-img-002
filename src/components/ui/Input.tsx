"use client";

import * as React from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const inputId = id ?? (label ? `input-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);

    return (
      <div className="flex w-full flex-col gap-2">
        {label ? (
          <label htmlFor={inputId} className="text-sm font-medium text-neutral-700">
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className={`h-10 rounded-md border border-neutral-300 px-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200 ${className}`.trim()}
          {...props}
        />
        {error ? <span className="text-xs text-red-600">{error}</span> : null}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
