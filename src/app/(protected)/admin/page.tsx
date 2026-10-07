import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/auth";

// Docs (not in the Learn course): https://nextjs.org/docs/app/guides/authentication#server-components  (auth check in pages)
// Docs (extra): https://authjs.dev/getting-started/session-management/protecting  ("Pages")
// Docs (role guide): https://authjs.dev/guides/role-based-access-control
export default async function AdminPage() {
  const session = await auth();
  if (!session) redirect("/login"); // Authentication: logged-in কি না
  if (session.user.role !== "admin") redirect("/dashboard"); // Authorization: admin কি না

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Admin area</h1>
      <p className="text-sm opacity-70">Only admins can see this page.</p>
      <Link href="/dashboard" className="text-sm underline underline-offset-4">
        Back to dashboard
      </Link>
    </main>
  );
}

/*
────────────────────────── ব্যাখ্যা (বাংলায়) ──────────────────────────
• দুটি আলাদা check:
    ১. `!session`  → Authentication (তুমি কে? login নেই) → /login
    ২. `role !== "admin"` → Authorization (তুমি কে জানি, কিন্তু অনুমতি নেই) → /dashboard
  এটাই 401 বনাম 403-এর ধারণা: login নেই = 401, অনুমতি নেই = 403।
• নতুন role-restricted page বানাতে: ১) authorized callback-এ নিয়ম, ২) page-এর শুরুতে role check।
• Proxy আর এই check — দুটো কেন? Proxy দ্রুত ও আগে; এই check নির্ভরযোগ্য ও data-র কাছে। একটায় ফাঁক থাকলে অন্যটা ধরবে।
*/
