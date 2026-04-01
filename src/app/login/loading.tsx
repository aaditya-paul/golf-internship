export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass rounded-2xl p-8 space-y-6">
          <div className="space-y-3 text-center">
            <div className="mx-auto h-8 w-40 rounded bg-white/10 animate-pulse" />
            <div className="mx-auto h-4 w-64 rounded bg-white/10 animate-pulse" />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-4 w-20 rounded bg-white/10 animate-pulse" />
              <div className="h-11 w-full rounded-lg bg-white/10 animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-24 rounded bg-white/10 animate-pulse" />
              <div className="h-11 w-full rounded-lg bg-white/10 animate-pulse" />
            </div>
            <div className="h-11 w-full rounded-lg bg-primary/30 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
