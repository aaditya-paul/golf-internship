"use client";

import { Loader2, LogOut } from "lucide-react";
import { useFormStatus } from "react-dom";

export default function SignOutButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      title={pending ? "Signing out..." : "Sign Out"}
      aria-label="Sign out"
      className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-white/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <LogOut className="h-5 w-5" />
      )}
    </button>
  );
}
