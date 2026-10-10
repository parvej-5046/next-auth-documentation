import * as z from "zod";

// Docs (main, Learn course): https://nextjs.org/learn/dashboard-app/adding-authentication#adding-the-sign-in-functionality  (zod validation)
// Docs (extra): https://authjs.dev/getting-started/authentication/credentials  ("Validating credentials")  ·  https://zod.dev
export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()), // " A@X.com " → "a@x.com" (normalize)
  password: z.string().min(1), // login-এ শুধু খালি নয় কি না; শক্তি যাচাই sign-up-এ
});

/*
────────────────────────── ব্যাখ্যা (বাংলায়) ──────────────────────────
• কেন server-এ validate? Browser-এর `required` শুধু UX; attacker form এড়িয়ে সরাসরি request পাঠাতে পারে।
  তাই "client input কখনো বিশ্বাস করো না" — authorize()-এর শুরুতেই আবার যাচাই।
• Zod একই schema থেকে validation দেয়; `safeParse` error ছোড়ে না, `{ success }` ফেরত দেয়, তাই if দিয়ে সামলানো সহজ।
• normalize (trim, toLowerCase): একই মানুষ বড়/ছোট হাতের অক্ষরে email লিখলেও এক account পায়।
*/
