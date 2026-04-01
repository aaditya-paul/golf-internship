import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { User, LogOut, Settings, Trophy } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 w-full glass border-b border-white/5 backdrop-blur-3xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg tracking-tight">Swing&Win</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground/80">{user.email}</span>
            </div>

            <form action="/auth/signout" method="POST">
              <button
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-muted-foreground hover:text-red-400"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
