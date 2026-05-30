"use client";
import { forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: `
    bg-[var(--color-accent)] text-white
    hover:bg-[var(--color-accent-hover)]
    active:bg-[var(--color-accent)]
  `,
  secondary: `
    bg-transparent border border-[var(--color-border)]
    text-[var(--color-text-primary)]
    hover:bg-[var(--color-bg-hover)] hover:border-[var(--color-border-subtle)]
    active:bg-[var(--color-bg-active)]
  `,
  ghost: `
    bg-transparent text-[var(--color-text-secondary)]
    hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]
    active:bg-[var(--color-bg-active)]
  `,
  danger: `
    bg-[var(--color-danger)] text-white
    hover:opacity-90
    active:opacity-80
  `,
};

const sizeClasses: Record<Size, string> = {
  sm: "h-7 px-2.5 text-xs gap-1.5",
  md: "h-8 px-3 text-sm gap-2",
  lg: "h-9 px-4 text-[15px] gap-2",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "secondary", size = "md", loading, className = "", children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center rounded-none
          font-medium transition-all duration-[var(--duration-normal)]
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-primary)]
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${className}
        `.trim().replace(/\s+/g, " ")}
        {...props}
      >
        {loading ? (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
export { Button };
export type { ButtonProps };
