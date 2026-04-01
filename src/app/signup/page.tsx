import { signup } from "../login/actions";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import AuthSubmitButton from "@/components/AuthSubmitButton";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass rounded-2xl p-8 space-y-8 relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />

          <div className="relative text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight neon-text">
              Join the Club
            </h1>
            <p className="text-muted-foreground">
              Sign up to track your scores, choose your charity, and win the
              jackpot.
            </p>
          </div>

          <form action={signup} className="relative space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground/80"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-lg glass-input text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground/80"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 rounded-lg glass-input text-foreground"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-400/20 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {message && (
              <div className="flex items-center gap-2 text-green-400 bg-green-400/10 p-3 rounded-lg border border-green-400/20 text-sm">
                <p>{message}</p>
              </div>
            )}

            <AuthSubmitButton
              idleText="Sign Up"
              pendingText="Creating account..."
            />
          </form>

          <p className="relative text-center text-sm text-muted-foreground mt-8">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
