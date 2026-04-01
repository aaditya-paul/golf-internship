import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading charities...
      </div>

      <div className="h-12 w-full rounded-xl bg-white/10 animate-pulse" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-40 rounded-2xl border border-white/10 bg-white/5 animate-pulse"
            />
          ))}
        </div>
        <div className="h-64 rounded-2xl border border-white/10 bg-white/5 animate-pulse" />
      </div>
    </div>
  );
}
