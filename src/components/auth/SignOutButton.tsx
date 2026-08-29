"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { signOut } from "@/lib/actions/auth";

export function SignOutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await signOut();
          router.refresh();
          router.replace("/login");
        })
      }
      className="min-h-9 shrink-0 cursor-pointer rounded-full border border-hairline-strong bg-transparent px-4 text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted transition hover:border-accent hover:text-ink disabled:opacity-60"
    >
      {pending ? "Saliendo" : "Salir"}
    </button>
  );
}
