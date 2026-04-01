import { createClient } from "@/lib/supabase/server";
import AdminCharityList from "./AdminCharityList";

export default async function AdminCharitiesPage() {
  const supabase = await createClient();

  const { data: charities } = await supabase
    .from("charities")
    .select("*")
    .order("name", { ascending: true });

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-3xl font-bold">Charity Directory</h1>
          <p className="text-muted-foreground mt-1">
            Add, update, or remove charitable organizations.
          </p>
        </div>
      </div>

      <AdminCharityList initialCharities={charities || []} />
    </div>
  );
}
