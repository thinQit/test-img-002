import * as React from "react";

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  title?: string;
  footer?: React.ReactNode;
};

export default function Card({ title, footer, className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-lg border border-neutral-200 bg-white p-6 shadow-sm ${className}`.trim()}
      {...props}
    >
      {title ? <h3 className="mb-3 text-lg font-semibold text-neutral-900">{title}</h3> : null}
      <div className="text-sm text-neutral-700">{children}</div>
      {footer ? <div className="mt-4 border-t border-neutral-200 pt-4">{footer}</div> : null}
    </div>
  );
}
