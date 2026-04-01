"use client";

import { useState, useEffect } from "react";
import {
  PlayCircle,
  CheckCircle,
  Loader2,
  TrendingUp,
  TrendingDown,
  Shuffle,
  Info,
  AlertTriangle,
} from "lucide-react";
import { simulateDraw, publishDraw, calculatePrizePool } from "./actions";

type PoolData = Awaited<ReturnType<typeof calculatePrizePool>>;

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const MODES = [
  {
    value: "most_frequent",
    label: "Most Frequent Scores",
    icon: TrendingUp,
    desc: "Picks the 5 numbers players submit most often — higher community engagement.",
  },
  {
    value: "least_frequent",
    label: "Least Frequent Scores",
    icon: TrendingDown,
    desc: "Picks the 5 numbers submitted least — harder to win, bigger suspense.",
  },
  {
    value: "random",
    label: "Pure Random (RNG)",
    icon: Shuffle,
    desc: "Completely random 5 numbers, 1–45. No bias.",
  },
] as const;

export default function AdminDrawManager({
  activeDraws,
}: {
  activeDraws: any[];
}) {
  const now = new Date();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<
    "most_frequent" | "least_frequent" | "random"
  >("most_frequent");
  const [drawMonth, setDrawMonth] = useState(now.getMonth() + 1);
  const [drawYear, setDrawYear] = useState(now.getFullYear());
  const [poolData, setPoolData] = useState<PoolData | null>(null);
  const [fetchingPool, setFetchingPool] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Eagerly fetch pool calculation
  useEffect(() => {
    async function load() {
      setFetchingPool(true);
      const res = await calculatePrizePool();
      setPoolData(res);
      setFetchingPool(false);
    }
    load();
  }, []);

  async function handleSimulate() {
    setLoading(true);
    setError(null);
    const res = await simulateDraw(mode, drawMonth, drawYear);
    if (res?.error) setError(res.error);
    setLoading(false);
  }

  async function handlePublish(id: string) {
    if (
      !confirm(
        "Publish this draw? This is irreversible — all users will be notified immediately.",
      )
    )
      return;
    setLoading(true);
    setError(null);
    const res = await publishDraw(id);
    if (res?.error) setError(res.error);
    setLoading(false);
  }

  const selectedMode = MODES.find((m) => m.value === mode)!;
  const yearRange = Array.from(
    { length: 3 },
    (_, i) => now.getFullYear() - 1 + i,
  );

  return (
    <div className="space-y-8">
      {/* Pool Preview Card */}
      <div className="glass-panel p-6 rounded-2xl border-primary/20 bg-primary/5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Info className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg">Auto-Calculated Prize Pool</h3>
        </div>

        {fetchingPool ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Fetching subscription
            data...
          </div>
        ) : poolData ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-black/30 p-3 rounded-xl">
              <p className="text-muted-foreground text-xs mb-1">
                Active Subscribers
              </p>
              <p className="font-bold text-lg">{poolData.activeSubs}</p>
            </div>
            <div className="bg-black/30 p-3 rounded-xl">
              <p className="text-muted-foreground text-xs mb-1">
                Avg Revenue / Sub (Monthly)
              </p>
              <p className="font-bold text-lg">
                ${poolData.pricePerSub.toFixed(2)}
              </p>
            </div>
            <div className="bg-black/30 p-3 rounded-xl">
              <p className="text-muted-foreground text-xs mb-1">
                Draw Allocation (20%)
              </p>
              <p className="font-bold text-lg">
                ${poolData.basePool.toFixed(2)}
              </p>
            </div>
            <div className="bg-primary/10 border border-primary/30 p-3 rounded-xl">
              <p className="text-primary text-xs mb-1 font-semibold">
                Final Pool{" "}
                {poolData.carryover > 0
                  ? `(+$${poolData.carryover.toFixed(2)} rollover)`
                  : ""}
              </p>
              <p className="font-bold text-2xl text-primary">
                ${poolData.finalPool.toFixed(2)}
              </p>
            </div>
          </div>
        ) : null}

        {poolData && (
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground bg-white/5 rounded-lg p-3 border border-white/5">
              <span className="font-medium text-white">Plan Mix:</span>{" "}
              {poolData.monthlySubs} monthly
              {poolData.monthlyPrice > 0
                ? ` ($${poolData.monthlyPrice.toFixed(2)}/mo)`
                : ""}
              {" · "}
              {poolData.yearlySubs} yearly
              {poolData.yearlyPrice > 0
                ? ` ($${poolData.yearlyPrice.toFixed(2)}/yr ≈ $${(poolData.yearlyPrice / 12).toFixed(2)}/mo)`
                : ""}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-center">
              {([5, 4, 3] as const).map((tier) => (
                <div
                  key={tier}
                  className="bg-white/5 rounded-lg p-2 border border-white/5"
                >
                  <p className="text-muted-foreground">Match {tier}</p>
                  <p className="font-bold text-white">
                    {tier === 5 ? "40%" : tier === 4 ? "35%" : "25%"}
                  </p>
                  <p className="text-primary">
                    $
                    {(
                      poolData.finalPool *
                      (tier === 5 ? 0.4 : tier === 4 ? 0.35 : 0.25)
                    ).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="glass-panel p-6 rounded-2xl border-white/10 space-y-6">
        <h3 className="font-semibold text-lg border-b border-white/5 pb-3">
          Configure New Draw
        </h3>

        {/* Month/Year picker */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">
            Draw Month & Year
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={drawMonth}
              onChange={(e) => setDrawMonth(Number(e.target.value))}
              className="flex-1 bg-black border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-primary"
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={drawYear}
              onChange={(e) => setDrawYear(Number(e.target.value))}
              className="bg-black border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-primary"
            >
              {yearRange.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mode selector */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Draw Mode</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {MODES.map((m) => (
              <button
                key={m.value}
                onClick={() => setMode(m.value)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  mode === m.value
                    ? "border-primary bg-primary/10 shadow-[0_0_12px_rgba(20,200,70,0.1)]"
                    : "border-white/10 bg-white/5 hover:border-white/30"
                }`}
              >
                <m.icon
                  className={`w-5 h-5 mb-2 ${mode === m.value ? "text-primary" : "text-muted-foreground"}`}
                />
                <p
                  className={`text-sm font-semibold ${mode === m.value ? "text-primary" : "text-white"}`}
                >
                  {m.label}
                </p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {m.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <button
          onClick={handleSimulate}
          disabled={loading || fetchingPool}
          className="w-full bg-primary text-black font-bold px-6 py-3 rounded-xl neon-button flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <PlayCircle className="w-5 h-5" />
          )}
          {loading
            ? "Generating..."
            : `Simulate ${MONTHS[drawMonth - 1]} ${drawYear} Draw`}
        </button>
      </div>

      {/* Existing Draws */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Draw History</h3>
        {activeDraws.length === 0 && (
          <div className="text-muted-foreground p-10 text-center border border-dashed border-white/10 rounded-xl">
            No draws created yet.
          </div>
        )}
        {activeDraws.map((draw) => {
          const monthName = MONTHS[(draw.draw_month ?? 1) - 1] ?? "—";
          return (
            <div
              key={draw.id}
              className="glass-panel p-5 rounded-xl flex flex-col md:flex-row justify-between gap-4 border-white/10"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="font-bold text-lg">
                    {monthName} {draw.draw_year}
                  </p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border font-semibold uppercase ${
                      draw.status === "published"
                        ? "bg-primary/20 text-primary border-primary/30"
                        : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                    }`}
                  >
                    {draw.status}
                  </span>
                  <span className="text-xs text-muted-foreground bg-white/5 px-2 py-0.5 rounded">
                    {draw.mode?.replace("_", " ")}
                  </span>
                </div>

                <div className="flex gap-2">
                  {(draw.winning_numbers || []).map((n: number, i: number) => (
                    <span
                      key={i}
                      className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-sm font-bold text-primary"
                    >
                      {n}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>
                    Pool:{" "}
                    <span className="text-white font-semibold">
                      ${Number(draw.total_pool || 0).toFixed(2)}
                    </span>
                  </span>
                  {draw.rollover_amount > 0 && (
                    <span className="text-yellow-400">
                      ↑ Incl. ${Number(draw.rollover_amount).toFixed(2)}{" "}
                      rollover
                    </span>
                  )}
                  {draw.jackpot_carryover > 0 &&
                    draw.status === "published" && (
                      <span className="text-orange-400">
                        → ${Number(draw.jackpot_carryover).toFixed(2)} rolling
                        into next month
                      </span>
                    )}
                </div>
              </div>

              <div className="shrink-0 self-center">
                {draw.status === "simulated" ? (
                  <button
                    onClick={() => handlePublish(draw.id)}
                    disabled={loading}
                    className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-5 py-2 rounded-lg font-semibold hover:bg-emerald-500/30 transition-colors flex items-center gap-2"
                  >
                    <PlayCircle className="w-4 h-4" /> Publish Results
                  </button>
                ) : (
                  <span className="flex items-center gap-1 text-primary text-sm font-bold">
                    <CheckCircle className="w-4 h-4" /> Published
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
