import { LoginForm } from "@/features/auth";

// Docs (main, Learn course): https://nextjs.org/learn/dashboard-app/adding-authentication#creating-the-login-route
export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
      <LoginForm />
      <p className="text-sm opacity-70">Demo: user@example.com or admin@example.com / password123</p>
    </main>
  );
}

/*
────────────────────────── ব্যাখ্যা (বাংলায়) ──────────────────────────
• `app/` শুধু routing স্তর — কোনো business logic নেই। আসল form `features/auth`-এ; এখানে শুধু বসানো।
• `(auth)` ফোল্ডারের বন্ধনী = route group: URL-এ আসে না (/login), শুধু ফাইল গোছায়।
• logged-in user এখানে এলে proxy (authorized callback) তাকে /dashboard-এ পাঠায়।
*/
