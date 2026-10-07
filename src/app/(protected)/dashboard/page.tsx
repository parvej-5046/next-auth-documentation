import Link from "next/link";
import { redirect } from "next/navigation";

import { LogoutButton } from "@/features/auth";
import { auth } from "@/lib/auth/auth";

// Docs (not in the Learn course): https://nextjs.org/docs/app/guides/authentication#server-components  (auth check in pages)
// Docs (extra): https://authjs.dev/getting-started/session-management/protecting  ("Pages")
export default async function DashboardPage() {
  const session = await auth(); // cookie থেকে session; logged-out হলে null
  if (!session) redirect("/login"); // proxy পার হলেও আবার যাচাই (defense in depth)

  const { name, role } = session.user;

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Welcome, {name}</h1>
      <p className="text-sm opacity-70">Role: {role}</p>
      {role === "admin" && (
        <Link href="/admin" className="text-sm underline underline-offset-4">
          Admin area
        </Link>
      )}
      <LogoutButton />
    </main>
  );
}

/*
────────────────────────── ব্যাখ্যা (বাংলায়) ──────────────────────────
• `await auth()`: Server Component-এ session পড়ার সরাসরি উপায়। RN-এ এর জায়গায় `useAuth()` hook ছিল।
• `if (!session) redirect("/login")`: proxy দ্রুত আটকায়, কিন্তু আসল সুরক্ষা এখানে (data-র কাছে)। redirect() error
  ছুড়ে থামায়, তাই তার পরের লাইনে `session` নিশ্চিতভাবে আছে (TypeScript-ও সেটা বোঝে)।
• কেন layout-এ নয়, page-এ? Next.js-এ navigation-এর সময় layout আবার render হয় না, ফলে layout-এর check এড়ানো যায়।
• `role === "admin"` দিয়ে লিংক দেখানো শুধু UX। UI লুকানো নিরাপত্তা নয়; আসল সুরক্ষা /admin page ও proxy-তে।
• Server Component হওয়ায় user-এর তথ্য server-এই render হয়ে আসে; client-এ আলাদা loading/flash নেই।
*/
