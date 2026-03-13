"use client";

export default function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 xl:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card rounded-2xl border border-border p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="skeleton h-3 w-20" />
              <div className="skeleton h-9 w-9 rounded-lg" />
            </div>
            <div className="skeleton h-7 w-28 mt-2" />
          </div>
        ))}
      </div>

      <div className="bg-card rounded-2xl border border-border p-4">
        <div className="mb-4 grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-xl" />
          ))}
        </div>
      </div>

      <div className="skeleton h-64 md:h-80 rounded-2xl" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div className="skeleton h-64 rounded-2xl" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    </div>
  );
}
