"use client";

import { useState } from "react";
import { Heart, CheckCircle, Search } from "lucide-react";
import { updateCharitySelection } from "./actions";

export default function CharityClientForm({
  currentSettings,
  charities,
}: {
  currentSettings: any;
  charities: any[];
}) {
  const [perc, setPerc] = useState(currentSettings.percentage);
  const [saving, setSaving] = useState(false);
  const [selectedCharityId, setSelectedCharityId] = useState<string>(
    currentSettings.charityId ?? "",
  );
  const [search, setSearch] = useState("");
  const filteredCharities = charities.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  function handlePercChange(val: string) {
    const num = parseInt(val, 10);
    setPerc(num);
  }

  async function savePercentage() {
    setSaving(true);
    const fd = new FormData();
    fd.append("charity_percentage", perc.toString());
    await updateCharitySelection(fd);
    setSaving(false);
  }

  async function selectCharity(id: string) {
    setSelectedCharityId(id); // immediate optimistic UI update
    const fd = new FormData();
    fd.append("charity_id", id);
    await updateCharitySelection(fd);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search charities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-xl pl-12 pr-4 py-4 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors text-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCharities.map((c) => {
            const isSelected = selectedCharityId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => selectCharity(c.id)}
                className={`flex flex-col text-left p-4 sm:p-6 rounded-2xl border transition-all ${isSelected ? "glass-panel border-primary shadow-[0_0_15px_rgba(20,200,70,0.15)] ring-1 ring-primary" : "bg-white/5 border-white/5 hover:bg-white/10"}`}
              >
                <div className="flex justify-between w-full mb-2">
                  <Heart
                    className={`w-6 h-6 ${isSelected ? "text-primary fill-primary" : "text-muted-foreground"}`}
                  />
                  {isSelected && (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  )}
                </div>
                <h3 className="font-bold text-lg">{c.name}</h3>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {c.description}
                </p>

                <div className="mt-4 text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded inline-flex w-fit">
                  Total Raised: ${c.total_raised}
                </div>
              </button>
            );
          })}
          {filteredCharities.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              No charities found matching "{search}"
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="glass-panel p-6 rounded-2xl border-white/10 lg:sticky lg:top-24">
          <h3 className="text-xl font-bold mb-4">Contribution Level</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Adjust how much of your monthly subscription is donated.
          </p>

          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-medium">Percentage</span>
            <span className="text-3xl font-black text-primary">{perc}%</span>
          </div>

          <input
            type="range"
            min="10"
            max="100"
            value={perc}
            onChange={(e) => handlePercChange(e.target.value)}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>10% (Min)</span>
            <span>100% (Max)</span>
          </div>

          <button
            onClick={savePercentage}
            disabled={saving || perc === currentSettings.percentage}
            className="w-full mt-8 bg-primary text-primary-foreground font-semibold px-4 py-3 rounded-xl neon-button disabled:opacity-50 disabled:shadow-none"
          >
            {saving ? "Saving..." : "Save Preference"}
          </button>
        </div>
      </div>
    </div>
  );
}
