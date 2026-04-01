import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading dashboard...
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="glass-panel rounded-2xl border-white/10 p-6 lg:col-span-2 space-y-4">
          <div className="h-6 w-40 rounded bg-white/10 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="h-10 w-full rounded-lg bg-white/10 animate-pulse" />
              <div className="h-10 w-full rounded-lg bg-white/10 animate-pulse" />
              <div className="h-10 w-28 rounded-lg bg-primary/30 animate-pulse" />
            </div>
            <div className="h-44 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel rounded-2xl border-white/10 p-6 h-44 animate-pulse" />
          <div className="glass-panel rounded-2xl border-white/10 p-6 h-44 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
