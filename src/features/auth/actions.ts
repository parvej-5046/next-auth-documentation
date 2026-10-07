"use server"; // এই ফাইলের সব export server-এ চলে; client থেকে form action হিসেবে ডাকা যায়

import { AuthError } from "next-auth";

import { signIn, signOut } from "@/lib/auth/auth";

// Docs (main, Learn course): https://nextjs.org/learn/dashboard-app/adding-authentication#updating-the-login-form  (authenticate server action)
// Docs (extra): https://authjs.dev/getting-started/authentication/credentials  ("Signin Form")
export async function login(_previousState: string | undefined, formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard", // সফল হলে এখানে redirect
    });
  } catch (error) {
    // A successful signIn redirects by throwing, so only handle auth failures here.
    if (error instanceof AuthError) return "Incorrect email or password."; // একই বার্তা (কোনটা ভুল বলি না)
    throw error; // redirect-ও একটা error; আবার না ছুড়লে redirect কাজ করবে না!
  }
}

// Docs (main, Learn course): https://nextjs.org/learn/dashboard-app/adding-authentication#adding-the-logout-functionality
// Docs (extra): https://authjs.dev/getting-started/session-management/login  ("Signout")
export async function logout() {
  await signOut({ redirectTo: "/login" });
}

/*
────────────────────────── ব্যাখ্যা (বাংলায়) ──────────────────────────
এটা RN reference-এর signIn/signOut (auth-provider.tsx)-এর সমতুল্য — তবে server-এ চলে।

══════════════════════════ login / logout — বিস্তারিত ══════════════════════════

━━━ ১. login(previousState, formData) ━━━
কাজ: ইউজারকে ভেতরে ঢোকানো।

  ধাপ  কোড                                   কী হয়                                  কেন
  ──── ───────────────────────────────────── ─────────────────────────────────────── ─────────────────────────────
  ১    signIn("credentials", {...})           Auth.js authorize() চালায               password browser থেকে সরাসরি
                                                                                       server কোডে যায়
  ২    (সফল হলে) cookie বসানো + redirect       httpOnly session cookie বসে,             আমাদের হাতে cookie/redirect
                                              /dashboard-এ যায়                         লিখতে হয় না
  ৩    catch → AuthError                       ভুল credential হলে string ফেরত           form সেটা error হিসেবে দেখায়
  ৪    throw error (বাকিগুলো)                  আসল redirect error-টা আবার ছুড়ি          না ছুড়লে সফল login-এও redirect
                                                                                       হতো না — জনপ্রিয় gotcha

  ব্যর্থ হলে: AuthError ধরা পড়ে → "Incorrect email or password." ফেরত → কোনো cookie বসে না।
  নেভিগেশন:  কোথাও router.push() নেই — Auth.js নিজেই redirect করে।
  `_previousState`: useActionState-এর নিয়মে প্রথম আর্গুমেন্ট আগের ফল; আমরা ব্যবহার করি না, তাই `_` প্রিফিক্স।

━━━ ২. logout() ━━━
কাজ: ইউজারকে বের করা।
  • signOut() session cookie মুছে দেয়, তারপর /login-এ পাঠায়।
  • Stateless session-এ server-এ মোছার কিছু নেই; cookie গেলেই প্রমাণ গেল।
  • Logout POST (form action), GET লিংক নয় — নইলে কেউ <img src="/logout"> বসিয়ে অন্যকে জোর করে logout করাতে পারত।

━━━ নিরাপত্তা ━━━
  • user enumeration: "email নেই" আলাদা বললে attacker জেনে যায় কোন email-এ account আছে। তাই একই বার্তা।
  • CSRF: Auth.js নিজে CSRF token ও Server Action-এ Next.js Origin যাচাই সামলায়।
  • উন্নতির জায়গা: rate limiting (brute-force ঠেকাতে), account lockout, 2FA।
*/
