"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

type AuthSubmitButtonProps = {
  idleText: string;
  pendingText: string;
};

export default function AuthSubmitButton({
  idleText,
  pendingText,
}: AuthSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-semibold text-primary-foreground neon-button disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {pending ? pendingText : idleText}
    </button>
  );
}
