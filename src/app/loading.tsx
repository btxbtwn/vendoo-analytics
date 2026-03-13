import LoadingSkeleton from "@/components/LoadingSkeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-[1600px] space-y-6 animate-pulse">
        <div className="h-10 w-56 rounded-xl bg-muted skeleton" />
        <LoadingSkeleton />
      </div>
    </div>
  );
}
