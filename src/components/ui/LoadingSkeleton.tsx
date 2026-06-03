"use client";

import { memo } from "react";

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  variant?: "text" | "rect" | "circle";
  className?: string;
}

const variantClasses = {
  text: "rounded-none",
  rect: "rounded-none",
  circle: "rounded-none",
};

function Skeleton({ width, height, variant = "rect", className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-[var(--color-bg-active)] ${variantClasses[variant]} ${className}`}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
      }}
    />
  );
}

const SkeletonRow = memo(function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-[var(--color-border)]">
      <Skeleton height={14} className="flex-1" />
      <Skeleton width={60} height={14} />
      <Skeleton width={80} height={14} />
      <Skeleton width={50} height={14} />
    </div>
  );
});

const SkeletonCard = memo(function SkeletonCard() {
  return (
    <div className="p-5 border border-[var(--color-border)] rounded-none bg-[var(--color-bg-elevated)]">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton width={32} height={32} variant="rect" className="rounded-none" />
        <Skeleton width={80} height={12} />
      </div>
      <Skeleton width={120} height={28} className="mb-2" />
      <Skeleton width={60} height={12} />
    </div>
  );
});

const SkeletonChart = memo(function SkeletonChart() {
  return (
    <div className="border border-[var(--color-border)] rounded-none bg-[var(--color-bg-surface)] p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Skeleton width={160} height={16} className="mb-2" />
          <Skeleton width={100} height={12} />
        </div>
        <Skeleton width={80} height={24} className="rounded-none" />
      </div>
      <Skeleton height={240} className="w-full" />
    </div>
  );
});

const SkeletonTable = memo(function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="border border-[var(--color-border)] rounded-none bg-[var(--color-bg-surface)] overflow-hidden">
      <div className="flex items-center gap-4 py-3 px-4 border-b border-[var(--color-border)]">
        <Skeleton width={40} height={10} />
        <Skeleton width={80} height={10} />
        <Skeleton width={60} height={10} />
        <Skeleton width={70} height={10} />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
});

export { Skeleton, SkeletonCard, SkeletonChart, SkeletonTable, SkeletonRow };
export type { SkeletonProps };
