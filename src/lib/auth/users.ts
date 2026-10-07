import type { User } from "next-auth";

type StoredUser = User & { password: string }; // User-এর সাথে password; শুধু এই ফাইলের ভেতরে

// Docs (main, Learn course): https://nextjs.org/learn/dashboard-app/adding-authentication#adding-the-sign-in-functionality  (getUser + bcrypt.compare)
// Docs (extra): https://nextjs.org/learn/dashboard-app/adding-authentication#password-hashing  ·  https://authjs.dev/getting-started/authentication/credentials
// Mock database. In the real task, replace `verifyCredentials` with a DB/API call
// (and compare a hashed password, e.g. bcrypt.compare) that returns the same shape.
const users: StoredUser[] = [
  {
    id: "1",
    name: "Ada User",
    email: "user@example.com",
    password: "password123",
    role: "user",
  },
  {
    id: "2",
    name: "Alan Admin",
    email: "admin@example.com",
    password: "password123",
    role: "admin",
  },
];

export async function verifyCredentials(
  email: string,
  password: string,
): Promise<User | null> {
  const found = users.find(
    (user) => user.email === email && user.password === password,
  );
  if (!found) return null; // ইমেইল নেই বা password ভুল — একই ফল (কোনটা ভুল তা বলি না)

  const { password: _password, ...user } = found; // password বাদ দিয়ে বাকিটা ফেরত
  return user;
}

/*
────────────────────────── ব্যাখ্যা (বাংলায়) ──────────────────────────
• এই পুরো ফাইলটা শুধু নকল backend (RN reference-এর mock mode-এর মতো)। ইন্টারভিউ/পরীক্ষায় আসল API না থাকলেও
  পুরো flow দেখানো যায়। আসল কাজে এই ফাইলের ভেতরটা বদলে যাবে, বাকি কিছু নয়।
• যা থাকবে: ফাংশনের "চুক্তি" — `verifyCredentials(email, password) → User | null`। authorize() ঠিক এটাই চায়।
• যা যাবে: users array, plain-text password (আসলে কখনো plain text রাখা যায় না — leak হলে সবার password ফাঁস)।

আসল কাজে এটা কেমন হবে:
  ১. আলাদা backend API থাকলে → `fetch(API_URL + "/auth/login", { method: "POST", body })`; res.ok না হলে null;
     নইলে { id, name, email, role } ফেরত।
  ২. নিজের database থাকলে → email দিয়ে user খুঁজে `bcrypt.compare(password, user.passwordHash)`।
  দুই ক্ষেত্রেই password ফেরত user-এ থাকবে না।
*/
