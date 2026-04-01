"use client";

import { useRef, useState } from "react";
import { Info, Loader2 } from "lucide-react";
import { addScore } from "./actions";

export default function ScoreForm({
  currentScoresCount,
  onScoreAdded,
}: {
  currentScoresCount: number;
  onScoreAdded?: () => void | Promise<void>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const isLocked = currentScoresCount >= 5;
  const isSubmitting = loading;

  async function handleSubmit(formData: FormData) {
    if (isLocked) return;
    setError(null);
    try {
      const result = await addScore(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        formRef.current?.reset();
        if (onScoreAdded) {
          await onScoreAdded();
        }
      }
    } catch {
      setError("Failed to add score. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLocked || loading) return;
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    void handleSubmit(formData);
  }

  return (
    <div className="space-y-4">
      <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-2 mb-4">
        <h3 className="font-semibold text-sm flex items-center gap-2 text-primary">
          <Info className="w-4 h-4" /> How to Play
        </h3>
        <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-5">
          <li>
            Enter your <strong>18-hole Stableford scores</strong> after each
            round you play.
          </li>
          <li>
            Scores must be between <strong>1 and 45 points</strong>.
          </li>
          <li>
            Your latest 5 distinct scores automatically generate your{" "}
            <strong>monthly jackpot ticket</strong>.
          </li>
          <li className="text-red-300">
            Once you enter 5 scores, they are{" "}
            <strong>locked for the month</strong> and cannot be changed.
          </li>
        </ul>
      </div>

      {isLocked && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-3 rounded-lg text-sm font-semibold flex items-center justify-center">
          🔒 You have filled all 5 tickets for this draw. Changes are locked.
        </div>
      )}

      <form
        ref={formRef}
        onSubmit={handleFormSubmit}
        onInvalidCapture={() => setLoading(false)}
        className="flex gap-2"
        aria-busy={isSubmitting}
      >
        <input
          type="number"
          name="score"
          min="1"
          max="45"
          placeholder="Score (1-45)"
          required
          className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50 text-white"
          disabled={isSubmitting || isLocked}
        />
        <button
          type="submit"
          onClick={() => {
            if (!isLocked && !loading) {
              setLoading(true);
            }
          }}
          disabled={isSubmitting || isLocked}
          className="bg-primary text-primary-foreground font-semibold px-6 py-2 rounded-lg neon-button disabled:opacity-50 disabled:grayscale transition-all inline-flex items-center justify-center gap-2"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSubmitting ? "Adding ticket..." : "Add"}
        </button>
      </form>

      {isSubmitting && (
        <div className="inline-flex items-center gap-2 text-xs text-primary/90">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Adding your ticket and updating your dashboard...
        </div>
      )}

      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
    </div>
  );
}
