import Link from "next/link";

import { siteConfig } from "@/config/site";
import { auth } from "@/lib/auth/auth";

// Docs (not in the Learn course): https://nextjs.org/docs/app/guides/authentication#server-components  (auth check in pages)
// Docs (extra): https://authjs.dev/getting-started/session-management/protecting  ("Pages")
export default async function Home() {
  const session = await auth();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">{siteConfig.name}</h1>
      <p className="text-sm opacity-70">{siteConfig.description}</p>
      {session && (
        <Link href="/dashboard" className="text-sm underline underline-offset-4">
          Go to dashboard
        </Link>
      )}
    </main>
  );
}

/*
────────────────────────── ব্যাখ্যা (বাংলায়) ──────────────────────────
• "/" এখন একটি public landing পাতা (আগে শুধু redirect ছিল)। এখানে কোনো access check নেই — সবাই দেখতে পারে।
• Header এখন root layout-এ (সব পাতায়): session অনুযায়ী "Sign in" (LoginButton) বা "Sign out" (LogoutButton)।
• Header নিজে auth জানে না; কোন বোতাম বসবে সেটা app/ ঠিক করে দেয় (shared কোড feature import করতে পারে না)।
*/
