"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bell, Trophy, Info } from "lucide-react";
import { toast } from "sonner";
import { markNotificationsAsRead } from "@/components/actions";
import { createClient } from "@/lib/supabase/client";

type Notification = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  cta_url?: string | null;
  cta_label?: string | null;
};

const URL_REGEX = /(https?:\/\/[^\s]+)/i;

function extractFirstUrl(text: string) {
  const match = text.match(URL_REGEX);
  if (!match) return null;
  return match[1].replace(/[),.!?]+$/, "");
}

function getNotificationLink(notification: Notification) {
  const href = notification.cta_url ?? extractFirstUrl(notification.message);
  if (!href) return null;

  return {
    href,
    label: notification.cta_label || "Open",
  };
}

export default function NotificationBell({
  initialNotifications,
  userId,
}: {
  initialNotifications: Notification[];
  userId: string | null;
}) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const hasCompletedInitialSyncRef = useRef(false);
  const seenNotificationIdsRef = useRef(
    new Set(initialNotifications.map((notification) => notification.id)),
  );
  const supabase = useMemo(() => createClient(), []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const showToastForNotification = useCallback((notification: Notification) => {
    const link = getNotificationLink(notification);

    toast(notification.title, {
      description: notification.message,
      duration: 7000,
      action: link
        ? {
            label: link.label,
            onClick: () => {
              window.location.href = link.href;
            },
          }
        : undefined,
    });
  }, []);

  const fetchLatestNotifications = useCallback(async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("notifications")
      .select("id,title,message,read,created_at,cta_url,cta_label")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error && data) {
      const newUnreadNotifications = data.filter(
        (notification) =>
          !notification.read &&
          !seenNotificationIdsRef.current.has(notification.id),
      );

      setNotifications(data);

      for (const notification of data) {
        seenNotificationIdsRef.current.add(notification.id);
      }

      if (hasCompletedInitialSyncRef.current) {
        for (const notification of newUnreadNotifications) {
          showToastForNotification(notification);
        }
      } else {
        hasCompletedInitialSyncRef.current = true;
      }
    }
  }, [showToastForNotification, supabase, userId]);

  useEffect(() => {
    setNotifications(initialNotifications);
    seenNotificationIdsRef.current = new Set(
      initialNotifications.map((notification) => notification.id),
    );
    hasCompletedInitialSyncRef.current = false;
  }, [initialNotifications]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!userId) return;

    void fetchLatestNotifications();

    const intervalId = window.setInterval(() => {
      void fetchLatestNotifications();
    }, 10000);

    function handleWindowFocus() {
      void fetchLatestNotifications();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void fetchLatestNotifications();
      }
    }

    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          void fetchLatestNotifications();
        },
      )
      .subscribe();

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      void supabase.removeChannel(channel);
    };
  }, [fetchLatestNotifications, supabase, userId]);

  async function handleOpen() {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      // Mark as read in DB
      await markNotificationsAsRead(
        notifications.filter((n) => !n.read).map((n) => n.id),
      );
      // Optimistic UI update
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      void fetchLatestNotifications();
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
      >
        <Bell className="w-6 h-6 text-white" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-background animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-[min(20rem,calc(100vw-2rem))] sm:w-80 bg-[#0f1117] border border-white/15 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] p-4 z-50 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
            <h3 className="font-bold text-lg text-white">Notifications</h3>
            <span className="text-xs text-muted-foreground">
              {notifications.length} recent
            </span>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No new notifications.
              </p>
            ) : (
              notifications.map((n) => {
                const link = getNotificationLink(n);
                const isExternalLink = Boolean(
                  link && link.href.startsWith("http"),
                );

                return (
                  <div
                    key={n.id}
                    className={`p-3 rounded-xl border ${n.read ? "bg-white/5 border-white/5" : "bg-primary/10 border-primary/25"} flex gap-3`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {n.title.includes("Won") ? (
                        <Trophy className="w-5 h-5 text-yellow-400" />
                      ) : (
                        <Info className="w-5 h-5 text-blue-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-semibold ${n.read ? "text-white/80" : "text-primary"}`}
                      >
                        {n.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {n.message}
                      </p>
                      {link && (
                        <a
                          href={link.href}
                          className={`mt-2 inline-flex text-xs font-semibold underline decoration-2 underline-offset-2 ${n.read ? "text-cyan-300 hover:text-cyan-200" : "text-sky-300 hover:text-sky-200"}`}
                          target={isExternalLink ? "_blank" : undefined}
                          rel={
                            isExternalLink ? "noreferrer noopener" : undefined
                          }
                        >
                          {link.label}
                        </a>
                      )}
                      <p className="text-[10px] text-muted-foreground/50 mt-2">
                        {new Date(n.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
