import { handlers } from "@/lib/auth/auth";

// Docs (not in the Learn course): https://authjs.dev/getting-started/installation?framework=next.js  ("Route Handler")
export const { GET, POST } = handlers; // Auth.js-এর সব endpoint এই দুই method-এ

/*
────────────────────────── ব্যাখ্যা (বাংলায়) ──────────────────────────
• `[...nextauth]` = catch-all: /api/auth/ এর পরের যেকোনো path (/csrf, /session, /callback/credentials, /signout...)
  এই এক ফাইলে চলে। ফোল্ডারের নাম হুবহু `[...nextauth]` হতে হবে।
• এখানে কোনো logic নেই — শুধু handlers বসানো। (app/ = শুধু routing; logic থাকে lib/ ও features/-এ।)
• যাচাই: ব্রাউজারে /api/auth/session খুললে logged-out অবস্থায় `null` দেখায়।
*/
