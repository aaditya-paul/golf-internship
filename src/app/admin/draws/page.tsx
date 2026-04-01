import { createClient } from "@/lib/supabase/server";
import AdminDrawManager from "@/app/admin/AdminDrawManager";

export default async function AdminDrawsPage() {
  const supabase = await createClient();
  const { data: activeDraws } = await supabase
    .from("draws")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-bold">Draw Management</h1>
        <p className="text-muted-foreground mt-1">
          Simulate new draws, review results, and publish to the system.
        </p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border-white/10">
        <AdminDrawManager activeDraws={activeDraws || []} />
      </div>
    </div>
  );
}
