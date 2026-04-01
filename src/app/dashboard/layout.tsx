import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { User, Trophy } from "lucide-react";
import SignOutButton from "./SignOutButton";

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
        <div className="mx-auto w-full max-w-6xl px-4 h-16 flex items-center justify-between gap-3">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />
            <span className="font-bold text-base sm:text-lg tracking-tight">
              Swing&Win
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <div className="hidden sm:flex px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm items-center gap-2 min-w-0">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground/80 truncate max-w-56">
                {user.email}
              </span>
            </div>

            <form action="/auth/signout" method="POST">
              <SignOutButton />
            </form>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
