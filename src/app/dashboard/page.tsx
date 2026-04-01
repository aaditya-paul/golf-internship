import {
  Trophy,
  CheckCircle,
  CreditCard,
  Heart,
  AlertTriangle,
  BookOpen,
  Medal,
} from "lucide-react";
import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe/server";
import { createClient } from "@/lib/supabase/server";
import ScoresPanel from "./ScoresPanel";
import SubscribeButton from "./SubscribeButton";
import ManageBillingButton from "./ManageBillingButton";
import NotificationBell from "@/components/NotificationBell";

type Score = {
  id: string;
  score: number;
  created_at: string;
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && session_id) {
    let shouldRedirect = false;
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      if (
        session.status === "complete" &&
        session.client_reference_id === user.id
      ) {
        await supabase
          .from("profiles")
          .update({
            subscription_status: "active",
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
          })
          .eq("id", user.id);

        shouldRedirect = true;
      }
    } catch (err) {
      console.error("Failed to verify session", err);
    }

    if (shouldRedirect) {
      redirect("/dashboard");
    }
  }

  let subscriptionStatus = "inactive";
  let subscriptionPlan: string | null = null;
  let charityPerc = 10;
  let charityName = "Pending Selection...";
  let scores: Score[] = [];
  let notifications: any[] = [];

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_status, charity_percentage, charities(name)")
      .eq("id", user.id)
      .single();
    subscriptionStatus = profile?.subscription_status || "inactive";
    subscriptionPlan = (profile as any)?.subscription_plan || null;
    charityPerc = profile?.charity_percentage || 10;
    if (profile?.charities) {
      charityName = (profile.charities as any).name;
    }

    const { data: userScores } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);
    scores = userScores || [];

    const { data: notifs } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    notifications = notifs || [];
  }

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your scores, subscription, and charity contributions.
          </p>
        </div>

        <div className="flex w-full sm:w-auto items-center justify-between sm:justify-start gap-3 sm:gap-4">
          <NotificationBell
            initialNotifications={notifications}
            userId={user?.id ?? null}
          />

          {subscriptionStatus === "active" ? (
            <div className="glass px-4 py-2 rounded-full border-primary/30 flex items-center gap-2 shadow-[0_0_15px_rgba(20,200,70,0.1)]">
              <CheckCircle className="w-5 h-5 text-primary" />
              <span className="text-sm font-bold text-primary">
                Active Member
              </span>
            </div>
          ) : (
            <div className="glass-panel px-4 py-2 rounded-full border-red-500/30 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-sm font-bold text-red-400">
                Subscription Inactive
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Submission Card */}
        <div className="glass-panel p-6 rounded-2xl border-white/10 lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <Trophy className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold">Your Scores</h2>
          </div>

          <ScoresPanel userId={user?.id ?? null} initialScores={scores} />
        </div>

        {/* Charity & Draw Card */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-5 h-5 text-pink-500" />
              <h3 className="font-semibold text-lg">My Charity</h3>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                You are donating{" "}
                <span className="text-white font-bold">{charityPerc}%</span> of
                your subscription.
              </p>
              <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                <p className="font-medium text-primary">{charityName}</p>
              </div>
              <a
                href="/dashboard/charities"
                className="text-xs text-muted-foreground hover:text-primary transition-colors mt-2 inline-block"
              >
                Change Charity &rarr;
              </a>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold text-lg">Subscription</h3>
            </div>
            <div className="space-y-4">
              {subscriptionStatus === "inactive" ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Subscribe to access the monthly draw and submit scores.
                  </p>
                  <SubscribeButton />
                </>
              ) : (
                <>
                  <p className="text-sm text-foreground">
                    Active Plan{" "}
                    <span className="text-muted-foreground text-xs capitalize">
                      ({subscriptionPlan || "Pro"})
                    </span>
                  </p>
                  <ManageBillingButton />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rules and Guide Section */}
      <div className="glass-panel p-5 sm:p-8 rounded-2xl border-white/10 space-y-6 mt-10 sm:mt-12">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
          <BookOpen className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-semibold">Club Rules & Guide</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" /> Scoring & Tickets
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Whenever you play a round of golf, enter your total Stableford
              score into the dashboard. The most recent 5 scores you submit make
              up your &quot;Lottery Ticket&quot; for our monthly draw. <br />
              <br />
              Scores must be between 1 and 45. Entering a new score
              automatically cycles out your oldest score, keeping your ticket
              fresh!
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Medal className="w-5 h-5 text-blue-400" /> The Monthly Draw
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              On the final day of every month, an automated draw selects 5
              winning numbers based on the community&apos;s combined score
              frequencies. If your latest ticket matches 3, 4, or all 5 numbers,
              you win a share of the jackpot prize pool! Prize details are
              communicated via email.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-400" /> Subscription
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              An active subscription is required to be eligible for the jackpot
              and to submit your scores. Subscriptions help fund the massive
              prize pools and power the charities making a difference.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" /> Charitable Giving
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Golf is a gentleman&apos;s game, and we believe in giving back.{" "}
              <strong>At least 10%</strong> of your subscription is distributed
              directly to the charity you select in your profile. You can change
              your chosen charity at any time from the Charity Directory.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
