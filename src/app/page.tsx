import Link from "next/link";
import { ArrowRight, Trophy, Heart } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col pt-16">
      <header className="fixed top-0 w-full z-50 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center border-b-0 border-white/5 backdrop-blur-3xl bg-[#011006]/50">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          <span className="text-lg sm:text-xl font-bold tracking-tighter">
            Swing&Win
          </span>
        </div>
        <nav className="flex gap-2 sm:gap-4 items-center">
          <Link
            href="/how-it-works"
            className="text-sm font-medium hover:text-primary transition-colors hidden sm:inline"
          >
            How It Works
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-xs sm:text-sm font-medium bg-primary text-primary-foreground px-3 sm:px-4 py-2 rounded-full neon-button"
          >
            Join Now
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center mt-16 sm:mt-20 relative">
        {/* Background glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 sm:w-150 sm:h-150 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl space-y-6 sm:space-y-8 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border-primary/20 text-primary text-xs sm:text-sm font-medium mb-3 sm:mb-4">
            <Heart className="w-4 h-4" />
            <span>Play Golf. Win Big. Give Back.</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tighter leading-tight">
            The Ultimate <br />
            <span className="neon-text text-transparent bg-clip-text bg-linear-to-r from-primary to-emerald-400">
              Golf Society
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Record your Stableford scores, enter the monthly draw, and support
            your favorite charities. An exclusive membership for golfers who
            want more out of every round.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-6 sm:pt-8">
            <Link
              href="/signup"
              className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg neon-button"
            >
              Get Started <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/how-it-works"
              className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg glass hover:bg-white/10 transition-colors"
            >
              How it works
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl w-full mt-20 sm:mt-32 mb-12 sm:mb-20">
          <div className="glass-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Trophy className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Track Scores</h3>
            <p className="text-muted-foreground">
              Submit up to 5 of your latest Stableford scores to generate your
              unique monthly lottery ticket.
            </p>
          </div>
          <div className="glass-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <svg
              className="w-8 h-8 text-primary mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-xl font-bold mb-2">Win the Jackpot</h3>
            <p className="text-muted-foreground">
              Match 3, 4, or 5 numbers in our monthly draw to win huge cash
              prizes from the community pool.
            </p>
          </div>
          <div className="glass-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Heart className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Give Back</h3>
            <p className="text-muted-foreground">
              At least 10% of your membership goes directly to the charity of
              your choice. Play with purpose.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
