// Docs (main, Learn course): https://nextjs.org/learn/dashboard-app/adding-authentication#protecting-your-routes-with-nextjs-proxy
// Docs (extra): https://authjs.dev/getting-started/session-management/protecting  ("Next.js Proxy")
// Docs (local): node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md
// Proxy = Auth.js-এর `auth` ফাংশন। প্রতি request-এ এটা `authorized` callback (lib/auth/auth.ts) চালায়।
export { auth as proxy } from "@/lib/auth/auth";

// _next, ছবি/ফাইল (dot আছে এমন) ও api-তে proxy চালাই না; ওগুলোতে page-guard লাগে না।
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};

/*
────────────────────────── ব্যাখ্যা (বাংলায়) ──────────────────────────
• Next.js 16-এ Middleware-এর নাম বদলে Proxy হয়েছে: ফাইল `src/proxy.ts`, export-এর নাম `proxy`।
  (Next 15 বা আগে: `middleware.ts`, export `middleware`।)
• এটা প্রতিটি request-এর আগে চলে — বিমানবন্দরের গেটের মতো: টিকিট (cookie) দেখে ঢুকতে দেয় বা ফেরত পাঠায়।
  কে কোথায় ঢুকবে সেই নিয়ম আছে `authorized` callback-এ।
• matcher কেন? সব request-এ (ছবি, _next ফাইল সহ) চালালে অকারণে ধীর হতো। তাই শুধু পাতার path-এ চালাই।
• Proxy শুধু "optimistic check" (দ্রুত অনুমান)। সত্যিকারের নিরাপত্তা page/action-এর `await auth()`-এ।
  কারণ proxy এড়ানো সম্ভব (matcher-এ ফাঁক, ২০২৫-এর Next.js middleware bypass CVE)। দুটো মিলে defense in depth।
*/
