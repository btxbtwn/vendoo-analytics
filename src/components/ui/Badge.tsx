"use client";

type BadgeVariant = "accent" | "success" | "warning" | "danger" | "neutral" | "highlight";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  accent:    "bg-[var(--color-accent-muted)]    text-[var(--color-accent)]",
  success:   "bg-[var(--color-success-muted)]  text-[var(--color-success)]",
  warning:   "bg-[var(--color-warning-muted)]  text-[var(--color-warning)]",
  danger:    "bg-[var(--color-danger-muted)]   text-[var(--color-danger)]",
  highlight: "bg-[var(--color-highlight-muted)] text-[var(--color-highlight)]",
  neutral:   "bg-[var(--color-bg-active)]       text-[var(--color-text-secondary)]",
};

function Badge({ variant = "neutral", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-0.5
        rounded-[var(--radius-full)]
        text-xs font-medium
        ${variantClasses[variant]}
        ${className}
      `.trim().replace(/\s+/g, " ")}
    >
      {children}
    </span>
  );
}

export { Badge };
export type { BadgeProps, BadgeVariant };
