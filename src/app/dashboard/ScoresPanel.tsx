"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ScoreForm from "./ScoreForm";

type Score = {
  id: string;
  score: number;
  created_at: string;
};

export default function ScoresPanel({
  userId,
  initialScores,
}: {
  userId: string | null;
  initialScores: Score[];
}) {
  const [scores, setScores] = useState<Score[]>(initialScores);
  const supabase = useMemo(() => createClient(), []);

  const fetchLatestScores = useCallback(async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("scores")
      .select("id,score,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    if (!error && data) {
      setScores(data);
    }
  }, [supabase, userId]);

  useEffect(() => {
    setScores(initialScores);
  }, [initialScores]);

  useEffect(() => {
    if (!userId) return;

    void fetchLatestScores();

    const intervalId = window.setInterval(() => {
      void fetchLatestScores();
    }, 5000);

    function handleWindowFocus() {
      void fetchLatestScores();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void fetchLatestScores();
      }
    }

    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const channel = supabase
      .channel(`scores:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "scores",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          void fetchLatestScores();
        },
      )
      .subscribe();

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      void supabase.removeChannel(channel);
    };
  }, [fetchLatestScores, supabase, userId]);

  const displayScores: Array<Score | null> = [...scores];
  while (displayScores.length < 5) {
    displayScores.push(null);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
      <ScoreForm
        currentScoresCount={scores.length}
        onScoreAdded={async () => {
          await fetchLatestScores();
        }}
      />

      <div className="bg-white/5 rounded-xl p-4 border border-white/5">
        <h3 className="text-sm font-medium mb-3">
          Current Ticket (
          <span className="text-primary font-bold">{scores.length}/5</span>)
        </h3>
        <div className="flex flex-wrap gap-2">
          {displayScores.map((s, idx) => (
            <div
              key={idx}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${s ? "glass text-primary border-primary/30" : "border border-white/10 border-dashed text-muted-foreground"}`}
            >
              {s ? s.score : "-"}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
