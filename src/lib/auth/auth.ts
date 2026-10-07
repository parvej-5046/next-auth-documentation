import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { loginSchema } from "./login.schema";
import { verifyCredentials } from "./users";

// Docs (main, Learn course): https://nextjs.org/learn/dashboard-app/adding-authentication#setting-up-nextauthjs
// Docs (extra): https://authjs.dev/getting-started/installation?framework=next.js
// NextAuth(config) থেকে চারটি জিনিস পাই: handlers (endpoint), auth (session পড়া), signIn, signOut
export const { handlers, auth, signIn, signOut } = NextAuth({
  // Docs (pages option, Learn course): https://nextjs.org/learn/dashboard-app/adding-authentication#adding-the-pages-option
  // Docs (session options, extra): https://authjs.dev/reference/nextjs
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 }, // database ছাড়া cookie-তে token; ৭ দিন মেয়াদ
  pages: { signIn: "/login" }, // Auth.js-এর ডিফল্ট পাতার বদলে আমাদের login পাতা

  // Docs (main, Learn course): https://nextjs.org/learn/dashboard-app/adding-authentication#adding-the-credentials-provider
  // Docs (extra): https://authjs.dev/getting-started/authentication/credentials
  providers: [
    Credentials({
      // email + password দিয়ে login। User ফেরত = সফল, null = ব্যর্থ।
      // Docs (extra)(: https://nextjs.org/learn/dashboard-app/adding-authentication#adding-the-sign-in-functionality  (authorize + zod)
      // Docs (main, Learn course): https://authjs.dev/getting-started/authentication/credentials  ("Validating credentials")
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials); // client-এর input বিশ্বাস করি না, আগে যাচাই
        if (!parsed.success) return null;
        return verifyCredentials(parsed.data.email, parsed.data.password);
      },
    }),
  ],

  callbacks: {
    // Docs (not in the Learn course): https://authjs.dev/guides/role-based-access-control  ("With JWT")
    // Login: copy id/role from the user into the JWT.
    jwt({ token, user }) {
      if (user) {
        // `user` শুধু login-এর মুহূর্তে থাকে; তখনই id/role token-এ রাখি
        token.id = user.id as string;
        token.role = user.role;
      }
      return token; // না ফেরত দিলে token নষ্ট হয়
    },
    // Docs (not in the Learn course): https://authjs.dev/guides/role-based-access-control  ("With JWT")
    // auth(): expose them on the session.
    session({ session, token }) {
      session.user.id = token.id; // token থেকে session-এ কপি, যাতে page-এ session.user.role পাওয়া যায়
      session.user.role = token.role;
      return session;
    },
    // Docs (main, Learn course): https://nextjs.org/learn/dashboard-app/adding-authentication#protecting-your-routes-with-nextjs-proxy  (authorized callback)
    // Docs (extra): https://authjs.dev/getting-started/session-management/protecting  ("Next.js Proxy")
    // Proxy: allow the request (true), send to /login (false) or redirect (Response).
    authorized({ auth: session, request: { nextUrl } }) {
      const { pathname } = nextUrl;
      const user = session?.user;

      if (pathname.startsWith("/admin")) return user?.role === "admin"; // শুধু admin
      if (pathname.startsWith("/dashboard")) return !!user; // যেকোনো logged-in user
      if (pathname === "/login" && user) {
        return Response.redirect(new URL("/dashboard", nextUrl)); // login থাকলে আবার login পাতা নয়
      }
      return true; // বাকি সব public
    },
  },
});

/*
────────────────────────── ব্যাখ্যা (বাংলায়) ──────────────────────────
এটা পুরো auth সিস্টেমের "মস্তিষ্ক" (RN reference-এর providers/auth-provider.tsx-এর সমতুল্য)। তিনটি কাজ:
 ১. Login  — Credentials provider দিয়ে email/password যাচাই করে।
 ২. Token  — jwt + session callback দিয়ে id/role cookie থেকে পাতা পর্যন্ত পৌঁছে দেয়।
 ৩. সুরক্ষা — authorized callback দিয়ে route ও role অনুযায়ী ঢুকতে দেয় বা আটকায়।

🔑 RN reference থেকে মূল পার্থক্য (এবং কেন):
 • RN-এ নিজে Context + useState + SecureStore দিয়ে user ধরে রাখতে হতো, আর প্রতিবার axios-এ token বসাতে হতো।
   এখানে Auth.js httpOnly cookie নিজে বসায়, browser নিজেই প্রতি request-এ পাঠায়, server `auth()` দিয়ে পড়ে।
 • RN-এ "isLoading" লাগত (token যাচাইয়ের সময় flicker ঠেকাতে)। এখানে server আগেই সিদ্ধান্ত নেয়, তাই লাগে না।

══════════════════════════ Credentials / authorize — বিস্তারিত ══════════════════════════

কাজ: email ও password ঠিক কি না যাচাই করে user ফেরত দেওয়া।

  ধাপ  কোড                                      কী হয়                           কেন
  ──── ───────────────────────────────────────── ───────────────────────────────── ───────────────────────────────
  ১    loginSchema.safeParse(credentials)         Zod দিয়ে email/password দেখে     browser-এর যাচাই এড়িয়ে সরাসরি
                                                                                    request এলেও যেন ধরা পড়ে
  ২    if (!parsed.success) return null           ভুল আকার হলে সাথে সাথে ব্যর্থ      অকারণে backend/DB-তে যেতে হয় না
  ৩    verifyCredentials(email, password)         আসল পরিচয় যাচাই (mock/DB/API)     password মেলে কি না এখানেই ঠিক হয়
  ৪    ফেরত User | null                            User = সফল, null = ব্যর্থ           Auth.js ঠিক এই চুক্তিই চায়

  ব্যর্থ হলে: null ফেরত → Auth.js CredentialsSignin error ছোড়ে → login action সেটা ধরে লাল বার্তা দেখায়।
  সফল হলে:   User পাঠানো হয় jwt callback-এ (নিচে)।

══════════════════════════ তিন callback — বিস্তারিত ══════════════════════════

callbacks হলো Auth.js-এর নিজস্ব option। আমরা ফাংশন জমা দিই, Auth.js সঠিক সময়ে ডাকে। নাম আমরা বদলাতে পারি না।

  Callback    কখন চলে                          কাজ                                   ফেরত
  ─────────── ──────────────────────────────── ───────────────────────────────────── ─────────────
  jwt         login-এর মুহূর্তে, এবং auth()-তে  token-এ কী রাখব (id, role)             token
  session     auth() ডাকলে                      session-এ কী দেখাব (token থেকে কপি)       session
  authorized  প্রতিটি request-এ, proxy-তে        route-এ ঢুকতে দেব কি না (Authorization)  true/false/Response

━━━ jwt ━━━
  • `user` শুধু login-এর মুহূর্তে একবার থাকে; পরের request-এ undefined। তাই `if (user)`।
  • id/role একবার token-এ লিখলেই হয়; এরপর token-ই আমাদের "প্রমাণ" (cookie-তে এনক্রিপ্টেড)।
  • `user.id as string`: Auth.js-এ id optional, আমরা জানি আছে।

━━━ session ━━━
  • jwt = cookie-র ভেতরে কী থাকবে। session = আমাদের কোড কী দেখবে। দুটো আলাদা।
  • এখানে কপি না করলে page-এ session.user.role পাওয়া যেত না।

━━━ authorized ━━━
  ফেরত    মানে                       উদাহরণ
  ─────── ────────────────────────── ───────────────────────────────────────────
  true    যেতে দাও                   admin → /admin, বা public পাতা
  false   /login-এ পাঠাও             logged-out → /dashboard
  Response সেই redirect-ই পাঠাও       logged-in → /login খুললে /dashboard-এ

  • নিয়ম এক জায়গায়: নতুন route সুরক্ষা = আরেকটা `if (pathname.startsWith(...))`।
  • এটা "optimistic" check (দ্রুত অনুমান)। আসল নিরাপত্তা page-এর `await auth()`-এ। দুটো মিলে defense in depth।

══════════════════════════ session strategy "jwt" ══════════════════════════
  • cookie-তে এনক্রিপ্টেড token থাকে (database লাগে না)। Credentials provider-এ Auth.js শুধু এটাই সমর্থন করে।
  • দুর্বলতা: মেয়াদের (maxAge) আগে জোর করে বাতিল করা কঠিন। তাই মেয়াদ সীমিত (৭ দিন)।
  • cookie flag (httpOnly, sameSite, secure) Auth.js নিজে বসায়।
*/
