"use client";
import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`
          w-full h-8 px-3 rounded-none
          bg-transparent border
          text-[var(--text-base)] text-[var(--color-text-primary)]
          placeholder:text-[var(--color-text-tertiary)]
          transition-colors duration-[var(--duration-normal)]
          focus:outline-none focus:border-[var(--color-border-focus)] focus:ring-2 focus:ring-[var(--color-border-focus)] focus:ring-offset-0
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error
            ? "border-[var(--color-danger)]"
            : "border-[var(--color-border)] hover:border-[var(--color-border-subtle)]"}
          ${className}
        `.trim().replace(/\s+/g, " ")}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
export { Input };
export type { InputProps };
