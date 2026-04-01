import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading winnings...
      </div>

      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-36 rounded-2xl border border-white/10 bg-white/5 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
