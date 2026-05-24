"use client";
import { forwardRef } from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, className = "", children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`
          w-full h-8 px-3 rounded-[var(--radius-md)]
          bg-[var(--color-bg-elevated)] border
          text-[var(--text-base)] text-[var(--color-text-primary)]
          transition-colors duration-[var(--duration-normal)]
          focus:outline-none focus:border-[var(--color-border-focus)] focus:ring-2 focus:ring-[var(--color-border-focus)]
          cursor-pointer appearance-none
          ${error
            ? "border-[var(--color-danger)]"
            : "border-[var(--color-border)] hover:border-[var(--color-border-subtle)]"}
          ${className}
        `.trim().replace(/\s+/g, " ")}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23606078' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 10px center",
          paddingRight: "32px",
        }}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = "Select";
export { Select };
export type { SelectProps };
