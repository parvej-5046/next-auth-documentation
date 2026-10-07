import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/auth";

// Docs (not in the Learn course): https://nextjs.org/docs/app/guides/authentication#server-components  (auth check in pages)
// Docs (extra): https://authjs.dev/getting-started/session-management/protecting  ("Pages")
export default async function Home() {
  const session = await auth();
  redirect(session ? "/dashboard" : "/login"); // সঠিক জায়গায় পাঠাই
}

/*
────────────────────────── ব্যাখ্যা (বাংলায়) ──────────────────────────
• "/" কোনো আলাদা পাতা নয়, শুধু প্রবেশদ্বার: session আছে কি না দেখে সঠিক জায়গায় পাঠায়।
  logged-in হলে /dashboard, নইলে /login — মাঝে কোনো "ফাঁকা" পাতা নেই।
• Server Component, তাই redirect server-এই হয়; browser-এ কোনো ঝলক (flash) বা loading দেখা যায় না।
• redirect() error ছুড়ে execution থামায়, তাই এই function কখনো JSX ফেরত দেয় না।
*/
