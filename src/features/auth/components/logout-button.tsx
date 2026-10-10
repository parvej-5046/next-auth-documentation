import { Button } from "@/components/ui/button";

import { logout } from "../actions";

// Docs (main, Learn course): https://nextjs.org/learn/dashboard-app/adding-authentication#adding-the-logout-functionality
// Docs (extra): https://authjs.dev/getting-started/session-management/login  ("Signout")
export function LogoutButton() {
  return (
    <form action={logout}>
      <Button type="submit">
        Sign out
      </Button>
    </form>
  );
}

/*
────────────────────────── ব্যাখ্যা (বাংলায়) ──────────────────────────
• Logout-কে <form> + server action বানিয়েছি, লিংক (GET) নয়। কারণ state বদলানো কাজ GET দিয়ে করা ঠিক নয় —
  কেউ <img src="/logout"> বসিয়ে অন্যকে জোর করে logout করাতে পারত। POST নিরাপদ।
• "use client" নেই → Server Component; JavaScript ছাড়াই কাজ করে।
*/
