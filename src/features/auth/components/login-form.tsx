"use client"; // useActionState একটা hook, তাই client component; আসল কাজ server action-এ

import { useActionState } from "react";

import { Button } from "@/components/ui/button";

import { login } from "../actions";

const inputClass = "rounded-md border border-foreground/20 bg-transparent px-3 py-2";

// Docs (main, Learn course): https://nextjs.org/learn/dashboard-app/adding-authentication#updating-the-login-form  (useActionState form)
// Docs (extra): https://react.dev/reference/react/useActionState
export function LoginForm() {
  // error = action-এর ফেরত string, formAction = form-এ বসাবো, pending = জমা চলছে কি না
  const [error, formAction, pending] = useActionState(login, undefined);

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-medium">
        Email
        <input name="email" type="email" autoComplete="email" required className={inputClass} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </label>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      {/* disabled={pending}: দুবার ক্লিক ঠেকায় */}
      <Button type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

/*
────────────────────────── ব্যাখ্যা (বাংলায়) ──────────────────────────
• "use client" কেন? useActionState একটা hook, আর hook শুধু client component-এ চলে। এই component শুধু UI ও error দেখায়।
• `<form action={formAction}>`: JavaScript বন্ধ থাকলেও form কাজ করে (progressive enhancement)।
• `name="email"` / `name="password"`: server action-এ `formData.get("email")` ঠিক এই name দিয়ে পড়ে; মিলতে হবে।
• `required`, `type="email"`: browser-এর প্রাথমিক যাচাই (শুধু UX)। আসল যাচাই server-এ।
• `autoComplete`: password manager ও browser ঠিকমতো সাহায্য করতে পারে।
• `role="alert"`: screen reader ব্যবহারকারীকে error পড়ে শোনায় (accessibility)।
• `disabled={pending}`: দুবার ক্লিক করে দুটো request পাঠানো ঠেকায়।
• RN reference-এ এটা ছিল `useState`, `onSubmit`, `isLoading` ইত্যাদি হাতে সামলানো; এখানে useActionState একসাথে দেয়।
*/
