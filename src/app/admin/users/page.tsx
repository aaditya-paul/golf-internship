import { createClient } from "@/lib/supabase/server";
import AdminUserList from "./AdminUserList";

export default async function AdminUsersPage() {
  const supabase = await createClient();

  // Fetch profiles with charities and latest scores
  const { data: profiles } = await supabase
    .from("profiles")
    .select(
      `
      id, email, subscription_status, charity_percentage,
      charity:charities (id, name),
      scores (id, score, date, created_at)
    `,
    )
    .order("created_at", { ascending: false });

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground mt-1">
          View users, subscriptions, and manage scores.
        </p>
      </div>

      <AdminUserList initialProfiles={profiles || []} />
    </div>
  );
}
