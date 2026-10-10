# Auth.js দিয়ে Authentication ও Authorization — শূন্য থেকে সম্পূর্ণ গাইড

> **প্রধান docs: Next.js Learn course** — https://nextjs.org/learn/dashboard-app/adding-authentication
> **এই গাইড ধরে এগোলে তুমি নিজে হাতে পুরো auth বানাতে পারবে।** প্রতিটি ধাপে আছে: লক্ষ্য → ফাইল → সম্পূর্ণ কোড → লাইন ধরে ব্যাখ্যা → official docs → "ঠিক হয়েছে কি না" যাচাই।
> কোডগুলো এই প্রজেক্টের আসল ফাইল থেকে নেওয়া (copy করে চালালে কাজ করবে)।
>
> **Stack:** Next.js 16 (App Router) · Auth.js v5 (`next-auth@beta`) · Credentials login · JWT session · Role-based access (`user` / `admin`) · Zod · Tailwind

---

## কোন docs অনুসরণ করবে? (authjs.dev বনাম nextjs.org)

তিনটি উৎস আছে, আর প্রতিটির কাজ আলাদা। **একটাকে প্রধান ধরো, বাকিগুলো নির্দিষ্ট জিনিসের জন্য।**

| উৎস | কী ধরনের | সেরা কিসের জন্য |
|---|---|---|
| **A. Next.js Learn — "Adding Authentication"**<br>https://nextjs.org/learn/dashboard-app/adding-authentication | ধাপে ধাপে **একটানা টিউটোরিয়াল** (Auth.js দিয়ে) | পরীক্ষায় **প্রধান অনুসরণ**। এক পাতায় প্রায় সবকিছু ক্রমানুযায়ী |
| **B. authjs.dev** | ছোট ছোট আলাদা **reference পাতা** | role (RBAC), TypeScript type, install, `jwt`/`session` callback |
| **C. Next.js Guide — "Authentication"**<br>https://nextjs.org/docs/app/guides/authentication | **ধারণা-ভিত্তিক গাইড** (Auth.js নয়, `jose` দিয়ে নিজে বানানো) | নিরাপত্তার ধারণা: DAL, proxy কতটা ভরসাযোগ্য, page/action/route-এ role check |

**কেন A প্রধান?** এটা সবচেয়ে সংগঠিত: একটা পাতায় ক্রম আছে — login route → NextAuth সেটআপ → `pages` option → `authorized` callback + Proxy → password hash → Credentials provider → `authorize` + zod → `useActionState` form → logout। আমাদের কোডের গঠন প্রায় একই।
**A-র সীমা:** role-based access (RBAC) নেই। সেটা **B**-র role guide থেকে নাও। আর A `auth.config.ts` আলাদা করে; Next 16-এর Proxy Node runtime-এ চলে, তাই আমরা সব একই `auth.ts`-এ রেখেছি (বাধা নেই)।
**B কখন?** ছোট প্রশ্নে সরাসরি উত্তর খুঁজতে (যেমন "session-এ role কীভাবে?", "type কীভাবে বাড়াব?")। পাতাগুলো ছোট ও আলাদা, তাই ক্রম বোঝা কঠিন।
**C কখন?** ইন্টারভিউতে "কেন" জিজ্ঞেস করলে, বা Auth.js ছাড়া নিজে বানাতে হলে। ধারণা সেরা, কিন্তু কোড Auth.js-এর নয়।

### প্রতিটি অংশের জন্য কোন docs (কোডের `// Docs` মন্তব্যের সাথে হুবহু মেলে)
প্রধান = **Learn course**: https://nextjs.org/learn/dashboard-app/adding-authentication

| অংশ / ফাইল | প্রধান (Learn course) | অতিরিক্ত |
|---|---|---|
| Install + `AUTH_SECRET` | https://nextjs.org/learn/dashboard-app/adding-authentication#setting-up-nextauthjs | https://authjs.dev/getting-started/installation?framework=next.js |
| `/login` পাতা | https://nextjs.org/learn/dashboard-app/adding-authentication#creating-the-login-route | — |
| `pages: { signIn }` (`auth.ts`) | https://nextjs.org/learn/dashboard-app/adding-authentication#adding-the-pages-option | https://authjs.dev/reference/nextjs |
| `Credentials` provider (`auth.ts`) | https://nextjs.org/learn/dashboard-app/adding-authentication#adding-the-credentials-provider | https://authjs.dev/getting-started/authentication/credentials |
| `authorize` + Zod (`auth.ts`, `login.schema.ts`) | https://nextjs.org/learn/dashboard-app/adding-authentication#adding-the-sign-in-functionality | https://authjs.dev/getting-started/authentication/credentials ("Validating credentials") · https://zod.dev |
| Mock/real user (`users.ts`) | https://nextjs.org/learn/dashboard-app/adding-authentication#adding-the-sign-in-functionality | https://nextjs.org/learn/dashboard-app/adding-authentication#password-hashing |
| `authorized` callback (`auth.ts`) | https://nextjs.org/learn/dashboard-app/adding-authentication#protecting-your-routes-with-nextjs-proxy | https://authjs.dev/getting-started/session-management/protecting |
| `proxy.ts` | https://nextjs.org/learn/dashboard-app/adding-authentication#protecting-your-routes-with-nextjs-proxy | local `proxy.md` |
| `login` action | https://nextjs.org/learn/dashboard-app/adding-authentication#updating-the-login-form | https://authjs.dev/getting-started/authentication/credentials ("Signin Form") |
| `LoginForm` + `useActionState` | https://nextjs.org/learn/dashboard-app/adding-authentication#updating-the-login-form | https://react.dev/reference/react/useActionState |
| `logout` + `LogoutButton` | https://nextjs.org/learn/dashboard-app/adding-authentication#adding-the-logout-functionality | https://authjs.dev/getting-started/session-management/login ("Signout") |
| `jwt` + `session` callback (**role**) | **Learn-এ নেই** | https://authjs.dev/guides/role-based-access-control ("With JWT") |
| `next-auth.d.ts` (**role type**) | **Learn-এ নেই** | https://authjs.dev/getting-started/typescript |
| Route handler (`[...nextauth]/route.ts`) | **Learn-এ নেই** | https://authjs.dev/getting-started/installation?framework=next.js |
| Page-এ `auth()` + role check | **Learn-এ নেই** | https://nextjs.org/docs/app/guides/authentication#server-components · https://authjs.dev/getting-started/session-management/protecting ("Pages") |

> সংক্ষেপে: **Learn course (A) দিয়ে শুরু করে ক্রমানুযায়ী এগোও → role ও type-এর জন্য authjs.dev (B) → page/action check ও নিরাপত্তার ধারণার জন্য nextjs.org guide (C)।**

---

## ০. আগে বুঝে নাও

### কী বানাচ্ছি
1. `/login` পাতায় email + password দিয়ে login
2. Login সফল হলে `/dashboard`; ভুল হলে error বার্তা
3. `/dashboard` শুধু logged-in user দেখবে
4. `/admin` শুধু **admin** role দেখবে
5. `/` পাতা: logged-in হলে `/dashboard`, না হলে `/login`
6. Sign out বাটন

### দুটি আলাদা শব্দ
- **Authentication (AuthN)** = তুমি কে? (পরিচয় যাচাই → login)
- **Authorization (AuthZ)** = তুমি কী করতে পারো? (অনুমতি → role দিয়ে)

### পুরো flow
```
LoginForm ──submit──▶ login (server action)
                         │ signIn("credentials", { email, password })
                         ▼
                   authorize()  ← Zod দিয়ে input যাচাই + verifyCredentials()
                         │ User ফেরত দিলে সফল, null হলে ব্যর্থ
                         ▼
                   jwt callback   → id, role token-এ রাখে
                         ▼
          এনক্রিপ্টেড httpOnly cookie (authjs.session-token) → redirect /dashboard

এরপর প্রতিটি request-এ browser নিজে cookie পাঠায়:
   proxy.ts ──▶ authorized callback  (দ্রুত check: login? role?)
        ▼
   page ──▶ await auth()  (আসল check, data-র কাছে)
```

### কেন এই নকশা (সংক্ষেপে)
- **Cookie, localStorage নয়:** httpOnly cookie-কে JavaScript পড়তে পারে না → XSS দিয়ে token চুরি কঠিন।
- **JWT session:** database লাগে না। (Credentials provider-এ Auth.js শুধু এটাই সমর্থন করে।)
- **দুই স্তরে সুরক্ষা (proxy + page):** proxy দ্রুত কিন্তু একমাত্র দেয়াল নয়। আসল check data-র কাছে।
- **Server Action দিয়ে login:** password সরাসরি server কোডে যায়, আলাদা API fetch লাগে না।

### শেষে ফোল্ডার কাঠামো (এটাই বানাবে)
```
.env.local                                  ← AUTH_SECRET (git-এ যাবে না)
src/
├── proxy.ts                                ← ধাপ ৭
├── types/next-auth.d.ts                    ← ধাপ ২
├── lib/auth/
│   ├── auth.ts                             ← ধাপ ৫  (মূল config)
│   ├── users.ts                            ← ধাপ ৪  (mock database)
│   └── login.schema.ts                     ← ধাপ ৩
├── features/auth/
│   ├── actions.ts                          ← ধাপ ৮
│   ├── index.ts                            ← ধাপ ৯
│   └── components/{login-form,logout-button}.tsx   ← ধাপ ৯
└── app/
    ├── page.tsx                            ← ধাপ ১০
    ├── api/auth/[...nextauth]/route.ts     ← ধাপ ৬
    ├── (auth)/login/page.tsx               ← ধাপ ১০
    └── (protected)/{dashboard,admin}/page.tsx   ← ধাপ ১০
```
> ফোল্ডারের `(auth)` / `(protected)` বন্ধনী = **route group**: URL-এ আসে না (`/login`, `/dashboard`), শুধু ফাইল গোছায়।
> কেন `lib/auth`-এ config, `features/auth`-এ নয়? proxy, page, route handler সবাই `auth` ব্যবহার করে (shared)। প্রজেক্টের architecture নিয়ম: shared কোড feature import করে না। তাই config shared-এ, শুধু login UI/actions feature-এ।

---

## ধাপ ১ — Install ও `AUTH_SECRET`

**লক্ষ্য:** library বসানো ও গোপন চাবি (secret) তৈরি।

```bash
npm i next-auth@beta zod
npx auth secret
```
- `next-auth@beta` → **v5** (App Router-এর জন্য)। শুধু `npm i next-auth` দিলে **v4** আসবে, আর এই গাইডের কোড কাজ করবে না।
- `zod` → input যাচাই।
- `npx auth secret` → `.env.local`-এ `AUTH_SECRET=...` বসিয়ে দেয়। হাতে করতে চাইলে: `openssl rand -base64 32`।

`.env.local` (git-এ যায় না; `.gitignore`-এ `.env*` আছে):
```bash
AUTH_SECRET=এখানে-লম্বা-random-string
```
আর `.env.example` (এটা commit হয়, **মান খালি**):
```bash
# Read by Auth.js itself. Generate with: npx auth secret   (or: openssl rand -base64 32)
AUTH_SECRET=
```

**`AUTH_SECRET` কী ও কেন?** Auth.js এই চাবি দিয়ে session cookie **এনক্রিপ্ট ও সই** করে। কেউ জানলে নকল session বানিয়ে admin সাজতে পারবে। তাই: git-এ commit নয়, production-এ আলাদা মান (host-এর secret settings-এ রাখো), সব server instance-এ একই মান।

**Docs (প্রধান — Learn course):** https://nextjs.org/learn/dashboard-app/adding-authentication#setting-up-nextauthjs
**Docs (অতিরিক্ত):** https://authjs.dev/getting-started/installation?framework=next.js
**যাচাই:** `package.json`-এ `"next-auth": "^5.0.0-beta.xx"` দেখাচ্ছে কি না।

---

## ধাপ ২ — Role type: `src/types/next-auth.d.ts`

**লক্ষ্য:** TypeScript-কে জানানো যে user/session/token-এ `role` আছে।

```ts
// src/types/next-auth.d.ts
import type { DefaultSession } from "next-auth";

// Docs (not in the Learn course): https://authjs.dev/getting-started/typescript  ("Module Augmentation")
type Role = "user" | "admin"; // নিজের type, কিছু extend করছি না — তাই plain `type` (union-ও এটাই লাগে)

declare module "next-auth" {
  interface User {
    role: Role; // authorize() যে user ফেরত দেয় তাতে role
  }
  interface Session {
    user: { id: string; role: Role } & DefaultSession["user"]; // auth()-এর ফল: name/email/image + id, role
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string; // cookie-র ভেতরের token-এ id ও role
    role: Role;
  }
}
```

**ব্যাখ্যা**
- Auth.js-এর `User`, `Session`, `JWT` type-এ ডিফল্টে `role` নেই। না জানালে `session.user.role` লিখলে error (বা `any` লাগত)।
- `declare module "next-auth" { interface ... }` = **module augmentation**: library-র type আবার খুলে নিজের field যোগ করা।
- **`interface` কেন, `type` নয়?** শুধু interface একাধিকবার ঘোষণা করলে TypeScript নিজে merge করে (declaration merging)। `type` পুনরায় খোলা যায় না।
- `Role` আমার নিজের type, কিছু extend করছি না, তাই plain `type`।
- `import type` লাইনটাই ফাইলকে "module" বানায়; নইলে `declare module` library-কে **প্রসারিত না করে প্রতিস্থাপন** করত।
- JWT-র জন্য `"@auth/core/jwt"`: docs-এ নাম `"next-auth/jwt"` লেখা, কিন্তু beta.32-তে সেটা type-এ কাজ করেনি; `@auth/core/jwt` করেছে (typecheck দিয়ে যাচাই)। **আগে docs-এরটা চেষ্টা করো; `token.role` এ "unknown" error এলে এটা ব্যবহার করো।**

**Docs (Learn course-এ নেই, তাই authjs.dev):** https://authjs.dev/getting-started/typescript ("Module Augmentation")
**যাচাই:** পরের ধাপগুলো শেষে `npm run typecheck` — `token.role`/`session.user.role`-এ error না এলে ঠিক।

---

## ধাপ ৩ — Input যাচাই: `src/lib/auth/login.schema.ts`

**লক্ষ্য:** server-এ email/password-এর আকার যাচাই।

```ts
// src/lib/auth/login.schema.ts
import * as z from "zod";

// Docs (main, Learn course): https://nextjs.org/learn/dashboard-app/adding-authentication#adding-the-sign-in-functionality  (zod validation)
// Docs (extra): https://authjs.dev/getting-started/authentication/credentials  ("Validating credentials")  ·  https://zod.dev
export const loginSchema = z.object({
  email: z.email().trim().toLowerCase(), // " A@X.com " → "a@x.com" (normalize)
  password: z.string().min(1), // login-এ শুধু খালি নয় কি না; শক্তি যাচাই sign-up-এ
});
```

**ব্যাখ্যা**
- `z.email()` → ঠিক email ফরম্যাট; `.trim().toLowerCase()` → `" A@X.com "` হয়ে যায় `"a@x.com"` (normalize)।
- `password: min(1)` → login-এ শুধু "খালি নয়" দেখি। (শক্তি/দৈর্ঘ্য নিয়ম sign-up-এ।)
- **কেন server-এ আবার যাচাই?** Browser-এর `required` শুধু UX। Attacker form এড়িয়ে সরাসরি request পাঠাতে পারে। **"Client input কখনো বিশ্বাস করো না।"**

**Docs (প্রধান — Learn course):** https://nextjs.org/learn/dashboard-app/adding-authentication#adding-the-sign-in-functionality  (zod validation)
**Docs (অতিরিক্ত):** https://authjs.dev/getting-started/authentication/credentials ("Validating credentials") · https://zod.dev
**যাচাই:** `loginSchema.safeParse({email:"a", password:""}).success === false`।

---

## ধাপ ৪ — Mock database: `src/lib/auth/users.ts`

**লক্ষ্য:** backend ছাড়াই চলার মতো নকল user তালিকা ও যাচাই ফাংশন।

```ts
// src/lib/auth/users.ts
import type { User } from "next-auth";

type StoredUser = User & { password: string }; // User-এর সাথে password; শুধু এই ফাইলের ভেতরে

// Docs (main, Learn course): https://nextjs.org/learn/dashboard-app/adding-authentication#adding-the-sign-in-functionality  (getUser + bcrypt.compare)
// Docs (extra): https://nextjs.org/learn/dashboard-app/adding-authentication#password-hashing  ·  https://authjs.dev/getting-started/authentication/credentials
// Mock database. In the real task, replace `verifyCredentials` with a DB/API call
// (and compare a hashed password, e.g. bcrypt.compare) that returns the same shape.
const users: StoredUser[] = [
  { id: "1", name: "Ada User", email: "user@example.com", password: "password123", role: "user" },
  { id: "2", name: "Alan Admin", email: "admin@example.com", password: "password123", role: "admin" },
];

export async function verifyCredentials(email: string, password: string): Promise<User | null> {
  const found = users.find((user) => user.email === email && user.password === password);
  if (!found) return null; // ইমেইল নেই বা password ভুল — একই ফল (কোনটা ভুল তা বলি না)

  const { password: _password, ...user } = found; // password বাদ দিয়ে বাকিটা ফেরত
  return user;
}
```

**ব্যাখ্যা**
- `User` = Auth.js-এর type (ধাপ ২-এ `role` যোগ হয়েছে)। `StoredUser` = তার সাথে `password`।
- `verifyCredentials` মিললে user ফেরত দেয় (**password বাদ দিয়ে**: `const { password: _password, ...user }`), নইলে `null`।
- **Password কখনো token/session-এ যায় না।**
- ফেরত type `User | null` — Auth.js-এর `authorize()`-এর দাবি ঠিক এটাই।

**আসল কাজে (job-এ) এটা বদলাবে কীভাবে?** শুধু এই ফাংশনের ভেতর:
```ts
export async function verifyCredentials(email: string, password: string): Promise<User | null> {
  const res = await fetch(`${process.env.API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) return null;
  const data = await res.json();              // backend-এর response অনুযায়ী
  return { id: data.id, name: data.name, email: data.email, role: data.role };
}
```
আর database থাকলে: user খুঁজে `await bcrypt.compare(password, user.passwordHash)` — **plain text password কখনো রাখা যায় না** (leak হলে সবার password ফাঁস)।
Backend-এর access token লাগলে ফেরত দেওয়া user-এ `token` যোগ করে ধাপ ২-এর type ও ধাপ ৫-এর `jwt`/`session` callback-এ রাখবে।

**Docs (প্রধান — Learn course):** https://nextjs.org/learn/dashboard-app/adding-authentication#adding-the-sign-in-functionality  (getUser + `bcrypt.compare`)
**Docs (অতিরিক্ত):** https://nextjs.org/learn/dashboard-app/adding-authentication#password-hashing · https://authjs.dev/getting-started/authentication/credentials
**যাচাই:** কোনো test ছাড়াই পরে লগইনে ধরা পড়বে (ধাপ ১১)।

---

## ধাপ ৫ — মূল config: `src/lib/auth/auth.ts`

**লক্ষ্য:** Auth.js-এর কেন্দ্র। এখান থেকে চারটি জিনিস বেরোয়: `handlers`, `auth`, `signIn`, `signOut`।

```ts
// src/lib/auth/auth.ts
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
      // Docs (main, Learn course): https://nextjs.org/learn/dashboard-app/adding-authentication#adding-the-sign-in-functionality  (authorize + zod)
      // Docs (extra): https://authjs.dev/getting-started/authentication/credentials  ("Validating credentials")
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
```

**লাইন ধরে ব্যাখ্যা**

| অংশ | কাজ |
|---|---|
| `NextAuth({...})` | সব config এক জায়গায়; ফেরত দেয় `{ handlers, auth, signIn, signOut }` |
| `handlers` | `/api/auth/*` endpoint-এর GET/POST (ধাপ ৬) |
| `auth()` | সার্ভারে বর্তমান session পড়ে (page, proxy, action) |
| `signIn()` / `signOut()` | server action থেকে login/logout (ধাপ ৮) |
| `session.strategy: "jwt"` | session cookie-তে এনক্রিপ্টেড token; database লাগে না |
| `session.maxAge` | ৬০×৬০×২৪×৭ সেকেন্ড = **৭ দিন**; এরপর আবার login |
| `pages.signIn: "/login"` | Auth.js-এর ডিফল্ট পাতার বদলে আমাদের `/login` |
| `Credentials({ authorize })` | email/password provider |
| `authorize()` | `User` ফেরত = সফল; `null` = ব্যর্থ। প্রথমে Zod দিয়ে যাচাই |

### Callbacks — বিস্তারিত (ইন্টারভিউয়ে প্রায়ই আসে)

**কোথা থেকে আসে?** `callbacks` হলো **Auth.js-এর নিজস্ব config option**। আমরা `NextAuth({...})`-এ এই নামে একটা object দিই, আর Auth.js নির্দিষ্ট মুহূর্তে সেই ফাংশনগুলো **নিজে ডাকে**। নাম (`jwt`, `session`, `authorized`) Auth.js ঠিক করে দেয়, আমরা বদলাতে পারি না; শুধু ভেতরের কাজ আমরা লিখি। "Callback" মানে "ফিরতি ডাক": আমরা ফাংশন জমা রাখি, সঠিক সময়ে অন্য কেউ সেটা চালায়।
Docs (callbacks reference): https://authjs.dev/reference/nextjs#callbacks

**কখন চলে?**
```
Login-এর মুহূর্তে          → jwt        (token বানানো; এখানে শুধু `user` থাকে)
এরপর auth() ডাকলে          → jwt (token পড়া) → session (session object বানানো)
প্রতিটি request-এ, proxy-তে → authorized (যেতে দেব কি না)
```

**১) `jwt({ token, user })` — token-এ কী রাখব**
- `token` = cookie-র ভেতরের JWT। শুরুতে Auth.js শুধু `name`, `email` ইত্যাদি বসায়।
- `user` = `authorize()` যে user ফেরত দিয়েছিল। **শুধু login-এর মুহূর্তে একবার** থাকে; পরের request-এ `undefined`।
- তাই `if (user)` দিয়ে login-এর সময়ই `id` ও `role` token-এ লিখি। এরপর token-ই আমাদের "প্রমাণ"।
- শেষে `return token` **বাধ্যতামূলক**; না ফেরত দিলে token নষ্ট হয়।
- `user.id as string`: Auth.js-এ `id` optional, তাই `as string` দিয়ে বলি আমরা জানি এটা আছে।

**২) `session({ session, token })` — session-এ কী দেখাব**
- `jwt` বানায় cookie-র token; কিন্তু `auth()` যে **session object** ফেরত দেয় সেটা আলাদা জিনিস।
- ডিফল্টে session-এ token-এর `id`/`role` আসে না। তাই হাতে কপি: `session.user.role = token.role`।
- এরপর page-এ `session.user.role` পাওয়া যায়।
- **পার্থক্য:** `jwt` = cookie-র **ভেতরে** কী থাকবে; `session` = আমাদের **কোড** কী দেখবে।
- এখানে type-safe থাকে ধাপ ২-এর `next-auth.d.ts`-এর কারণে।

**৩) `authorized({ auth, request })` — proxy-র সিদ্ধান্ত**
- প্রতিটি request-এর **আগে** proxy-তে চলে।
- `auth: session` = বর্তমান session (logged-out হলে `null`)। ফাইলে `auth` ফাংশনও আছে, তাই `session` নামে নিয়েছি।
- `request: { nextUrl }` = যে URL চাওয়া হচ্ছে।
- ফেরত মান:

| ফেরত | ফল |
|---|---|
| `true` | যেতে দাও |
| `false` | `/login`-এ পাঠাও (`pages.signIn` অনুযায়ী) |
| `Response` | সেই redirect-ই পাঠাও |

- আমাদের নিয়ম: `/admin...` → `role === "admin"` হলে `true`; `/dashboard...` → যেকোনো logged-in user; `/login`-এ logged-in user → `/dashboard`-এ redirect; বাকি সব public (`true`)।

**একটা পূর্ণ উদাহরণ (admin login)**
1. `authorize()` ফেরত দেয় `{ id: "2", role: "admin", ... }`
2. `jwt`: `token.id = "2"`, `token.role = "admin"` → cookie-তে এনক্রিপ্ট হয়ে যায়
3. পরের request-এ `/admin` → `authorized`: `user.role === "admin"` → `true`
4. `/admin` পাতায় `await auth()` → `session` callback: `session.user.role = "admin"`
5. পাতা role দেখে সিদ্ধান্ত নেয়

**ইন্টারভিউয়ে এক লাইন:** "`jwt` ঠিক করে token-এ কী থাকবে, `session` সেই তথ্য সার্ভারের কোডকে দেখায়, আর `authorized` proxy-তে route ও role দেখে ঢুকতে দেবে কি না ঠিক করে। Auth.js নিজে `role` চেনে না; `jwt` + `session` role-কে cookie থেকে পাতা পর্যন্ত পৌঁছে দেয়।"

**নিয়ম বাড়াতে:** শুধু `authorized`-এ আরেকটা `if (pathname.startsWith("/xyz")) return ...` যোগ করো।
**নতুন role (যেমন "editor") যোগ করতে:** ধাপ ২-এ `Role`-এ যোগ → এখানে নিয়ম → সংশ্লিষ্ট page-এ role check।

**Docs — অংশ অনুযায়ী (প্রধান = Learn course)**
| অংশ | প্রধান (Learn) | অতিরিক্ত |
|---|---|---|
| `NextAuth({...})` সেটআপ | https://nextjs.org/learn/dashboard-app/adding-authentication#setting-up-nextauthjs | https://authjs.dev/getting-started/installation?framework=next.js |
| `pages: { signIn }` | https://nextjs.org/learn/dashboard-app/adding-authentication#adding-the-pages-option | https://authjs.dev/reference/nextjs |
| `Credentials` provider | https://nextjs.org/learn/dashboard-app/adding-authentication#adding-the-credentials-provider | https://authjs.dev/getting-started/authentication/credentials |
| `authorize` + Zod | https://nextjs.org/learn/dashboard-app/adding-authentication#adding-the-sign-in-functionality | https://authjs.dev/getting-started/authentication/credentials ("Validating credentials") |
| `authorized` callback | https://nextjs.org/learn/dashboard-app/adding-authentication#protecting-your-routes-with-nextjs-proxy | https://authjs.dev/getting-started/session-management/protecting ("Next.js Proxy") |
| `jwt` + `session` callback (role) | **Learn-এ নেই** | https://authjs.dev/guides/role-based-access-control ("With JWT") |

**যাচাই:** `npm run typecheck` পাস। (এখনো page নেই, তাই চালিয়ে দেখা পরের ধাপে।)

---

## ধাপ ৬ — Route handler: `src/app/api/auth/[...nextauth]/route.ts`

**লক্ষ্য:** Auth.js-এর endpoint চালু করা।

```ts
// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth/auth";

// Docs (not in the Learn course): https://authjs.dev/getting-started/installation?framework=next.js  ("Route Handler")
export const { GET, POST } = handlers; // Auth.js-এর সব endpoint এই দুই method-এ
```

**ব্যাখ্যা**
- `[...nextauth]` = catch-all: `/api/auth/` এর পরের যেকোনো path (`/csrf`, `/session`, `/callback/credentials`, `/signout`...) এই এক ফাইলে চলে।
- কোনো logic নেই, শুধু `handlers` থেকে `GET`/`POST` export। (`app/` = শুধু routing।)
- ফোল্ডারের নাম **হুবহু** `[...nextauth]` রাখতে হবে।

**Docs (Learn course-এ নেই):** https://authjs.dev/getting-started/installation?framework=next.js ("Route Handler")
**যাচাই:** `npm run dev` চালিয়ে ব্রাউজারে `http://localhost:3000/api/auth/session` খোলো → `null` দেখাবে (এখনো login নেই)। এটা এলেই endpoint ঠিক।

---

## ধাপ ৭ — Proxy: `src/proxy.ts`

**লক্ষ্য:** প্রতিটি request-এর **আগে** দ্রুত সুরক্ষা।

```ts
// src/proxy.ts
// Docs (main, Learn course): https://nextjs.org/learn/dashboard-app/adding-authentication#protecting-your-routes-with-nextjs-proxy
// Docs (extra): https://authjs.dev/getting-started/session-management/protecting  ("Next.js Proxy")
// Docs (local): node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md
// Proxy = Auth.js-এর `auth` ফাংশন। প্রতি request-এ এটা `authorized` callback (lib/auth/auth.ts) চালায়।
export { auth as proxy } from "@/lib/auth/auth";

// _next, ছবি/ফাইল (dot আছে এমন) ও api-তে proxy চালাই না; ওগুলোতে page-guard লাগে না।
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
```

**ব্যাখ্যা**
- **Next.js 16-এ Middleware-এর নাম বদলে Proxy।** ফাইল `src/proxy.ts`, export-এর নাম `proxy`। (Next 15 বা আগে: `middleware.ts`, export `middleware`।)
- `auth` ফাংশনটাই proxy হিসেবে export। এটা প্রতি request-এ ধাপ ৫-এর `authorized` callback চালায়।
- `matcher`: কোন path-এ proxy চলবে। `api`, `_next/static`, `_next/image` এবং dot-যুক্ত ফাইল (ছবি, favicon) বাদ।
- বিমানবন্দরের গেটের মতো: টিকিট (cookie) দেখে ঢুকতে দেয় বা ফেরত পাঠায়।

**Docs (প্রধান — Learn course):** https://nextjs.org/learn/dashboard-app/adding-authentication#protecting-your-routes-with-nextjs-proxy
**Docs (অতিরিক্ত):** https://authjs.dev/getting-started/session-management/protecting ("Next.js Proxy")
**Docs (local):** `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`

**যাচাই:** logged-out অবস্থায় `http://localhost:3000/dashboard` খুললে `/login?callbackUrl=...`-এ চলে যাবে (পাতা এখনো নেই, তাই 404 দেখালেও URL বদলালেই proxy কাজ করছে)।

---

## ধাপ ৮ — Server actions: `src/features/auth/actions.ts`

**লক্ষ্য:** login ও logout-এর server কোড।

```ts
// src/features/auth/actions.ts
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
```

**ব্যাখ্যা**
- `"use server"` (প্রথম লাইনে) → এই ফাইলের সব export server-এ চলে; form থেকে সরাসরি ডাকা যায়।
- `login(_previousState, formData)` — `useActionState`-এর নিয়ম: প্রথম আর্গুমেন্ট আগের ফলাফল, দ্বিতীয় `FormData`।
- `signIn("credentials", {...})`: Auth.js `authorize()` চালায়; সফল হলে cookie বসিয়ে `redirectTo`-তে **redirect করে**।
- **সবচেয়ে গুরুত্বপূর্ণ gotcha:** Next.js-এ `redirect` আসলে একটা বিশেষ **error ছুড়ে** কাজ করে। তাই `catch`-এ শুধু `AuthError` (ভুল credential) ধরি, বাকিটা `throw error` করে আবার ছুড়ে দিই। সব ধরে ফেললে সফল login-এও redirect হবে না।
- ভুল হলে `string` ফেরত → form সেটাই error হিসেবে দেখায়।
- **একই বার্তা** ("Incorrect email or password"): "এই email নেই" আলাদা বললে attacker জেনে যায় কোন email-এ account আছে (**user enumeration**)।
- `logout`: `signOut()` cookie মুছে দেয়। Stateless session-এ server-এ মোছার কিছু নেই; cookie গেলেই প্রমাণ গেল।

**Docs — অংশ অনুযায়ী**
| অংশ | প্রধান (Learn) | অতিরিক্ত |
|---|---|---|
| `login` action (`try/catch` + `AuthError`) | https://nextjs.org/learn/dashboard-app/adding-authentication#updating-the-login-form (authenticate action) | https://authjs.dev/getting-started/authentication/credentials ("Signin Form") |
| `logout` (`signOut`) | https://nextjs.org/learn/dashboard-app/adding-authentication#adding-the-logout-functionality | https://authjs.dev/getting-started/session-management/login ("Signout") |
| `redirect()` | — | local: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/redirect.md` |

---

## ধাপ ৯ — UI: `LoginForm`, `LogoutButton`, `index.ts`

**লক্ষ্য:** form ও বাটন।

```tsx
// src/features/aut./components/login-form.tsx
"use client"; // useActionState একটা hook, তাই client component; আসল কাজ server action-এ

import { useActionState } from "react";

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

      <button
        type="submit"
        disabled={pending} // দুবার ক্লিক ঠেকায়
        className="rounded-md bg-foreground px-3 py-2 font-medium text-background disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
```

```tsx
// src/features/aut./components/logout-button.tsx
import { logout } from "../actions";

// Docs (main, Learn course): https://nextjs.org/learn/dashboard-app/adding-authentication#adding-the-logout-functionality
// Docs (extra): https://authjs.dev/getting-started/session-management/login  ("Signout")
export function LogoutButton() {
  return (
    <form action={logout}>
      <button type="submit" className="rounded-md border border-foreground/20 px-3 py-2 text-sm">
        Sign out
      </button>
    </form>
  );
}
```

```ts
// src/features/auth/index.ts
export { LoginForm } from "./components/login-form";
export { LogoutButton } from "./components/logout-button";
```

**ব্যাখ্যা — `LoginForm`**
- `"use client"` কারণ `useActionState` একটা hook (hook শুধু client component-এ)। আসল কাজ কিন্তু server action-এ।
- `useActionState(login, undefined)` → `[error, formAction, pending]`: `error` = action-এর ফেরত string, `pending` = জমা চলছে কি না।
- `<form action={formAction}>` — JS বন্ধ থাকলেও form কাজ করে (progressive enhancement)।
- `name="email"` / `name="password"` — `formData.get("email")` এই `name` দিয়ে পড়ে; মিলতে হবে।
- `required`, `type="email"` → browser-এর প্রাথমিক যাচাই (UX); আসল যাচাই server-এ।
- `autoComplete` → password manager ঠিকমতো কাজ করে। `role="alert"` → screen reader error পড়ে শোনায়। `disabled={pending}` → দুবার ক্লিক ঠেকায়।

**ব্যাখ্যা — `LogoutButton`**
- `<form action={logout}>` — logout **POST** (লিংক/GET নয়)। কারণ state বদলানো কাজ GET দিয়ে করলে কেউ `<img src="/logout">` বসিয়ে অন্যকে জোর করে logout করাতে পারে।
- `"use client"` নেই → Server Component, JS ছাড়াই কাজ করে।

**ব্যাখ্যা — `index.ts` (barrel)**
- feature-এর "সামনের দরজা"। বাইরের কোড শুধু `@/features/auth` থেকে import করবে (যেমন `import { LoginForm } from "@/features/auth"`); `actions.ts` লুকানো থাকে। প্রজেক্টের ESLint এই নিয়ম জোর করে মানায়।

**Docs — অংশ অনুযায়ী**
| অংশ | প্রধান (Learn) | অতিরিক্ত |
|---|---|---|
| `LoginForm` + `useActionState` | https://nextjs.org/learn/dashboard-app/adding-authentication#updating-the-login-form | https://react.dev/reference/react/useActionState |
| `LogoutButton` (`signOut`) | https://nextjs.org/learn/dashboard-app/adding-authentication#adding-the-logout-functionality | https://authjs.dev/getting-started/session-management/login ("Signout") |
| `/login` পাতা | https://nextjs.org/learn/dashboard-app/adding-authentication#creating-the-login-route | — |

---

## ধাপ ১০ — Pages

**লক্ষ্য:** চারটি পাতা। `app/` শুধু routing; logic নেই।

**১) Login পাতা**
```tsx
// src/app/(auth)/login/page.tsx
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
```

**২) Dashboard — যেকোনো logged-in user**
```tsx
// src/app/(protected)/dashboard/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";

import { LogoutButton } from "@/features/auth";
import { auth } from "@/lib/auth/auth";

// Docs (not in the Learn course): https://nextjs.org/docs/app/guides/authentication#server-components  (auth check in pages)
// Docs (extra): https://authjs.dev/getting-started/session-management/protecting  ("Pages")
export default async function DashboardPage() {
  const session = await auth(); // cookie থেকে session; logged-out হলে null
  if (!session) redirect("/login"); // proxy পার হলেও আবার যাচাই (defense in depth)

  const { name, role } = session.user;

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Welcome, {name}</h1>
      <p className="text-sm opacity-70">Role: {role}</p>
      {role === "admin" && (
        <Link href="/admin" className="text-sm underline underline-offset-4">
          Admin area
        </Link>
      )}
      <LogoutButton />
    </main>
  );
}
```

**৩) Admin — শুধু admin**
```tsx
// src/app/(protected)/admin/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/auth";

// Docs (not in the Learn course): https://nextjs.org/docs/app/guides/authentication#server-components  (auth check in pages)
// Docs (extra): https://authjs.dev/getting-started/session-management/protecting  ("Pages")
// Docs (role guide): https://authjs.dev/guides/role-based-access-control
export default async function AdminPage() {
  const session = await auth();
  if (!session) redirect("/login"); // Authentication: logged-in কি না
  if (session.user.role !== "admin") redirect("/dashboard"); // Authorization: admin কি না

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Admin area</h1>
      <p className="text-sm opacity-70">Only admins can see this page.</p>
      <Link href="/dashboard" className="text-sm underline underline-offset-4">
        Back to dashboard
      </Link>
    </main>
  );
}
```

**৪) Home (`/`) — প্রবেশদ্বার**
```tsx
// src/app/page.tsx
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/auth";

// Docs (not in the Learn course): https://nextjs.org/docs/app/guides/authentication#server-components  (auth check in pages)
// Docs (extra): https://authjs.dev/getting-started/session-management/protecting  ("Pages")
export default async function Home() {
  const session = await auth();
  redirect(session ? "/dashboard" : "/login"); // সঠিক জায়গায় পাঠাই
}
```

**ব্যাখ্যা**
- `await auth()` → session অথবা `null`। Server Component-এ `async` লাগে।
- **Proxy থাকতেও page-এ আবার check কেন?** Proxy দ্রুত "optimistic" check। কিন্তু একমাত্র দেয়াল নয় (matcher-এ ফাঁক থাকতে পারে, ২০২৫-এ Next.js middleware bypass CVE-ও এসেছিল)। আসল সুরক্ষা data-র কাছে: **defense in depth**।
- Layout-এ check নয়, **page-এ**: Next.js-এ navigation-এ layout আবার render হয় না, তাই layout-এর check এড়ানো যায়।
- Dashboard-এ admin লিংক শুধু UX। UI লুকানো নিরাপত্তা নয়; আসল সুরক্ষা `/admin` page ও proxy-তে।
- `redirect()` কিছু ফেরত দেয় না (error ছুড়ে থামায়), তাই তার পরের লাইনে `session` নিশ্চিতভাবে আছে (TypeScript-ও সেটা বোঝে)।

**Docs (Learn course-এ page-level check নেই):**
- https://nextjs.org/docs/app/guides/authentication#server-components  (page-এ auth/role check) — **প্রধান**
- https://authjs.dev/getting-started/session-management/protecting ("Pages")
- Admin/role: https://authjs.dev/guides/role-based-access-control

---

## ধাপ ১১ — চালিয়ে পরীক্ষা

**Docs (Learn course):** https://nextjs.org/learn/dashboard-app/adding-authentication#try-it-out

```bash
npm run dev
```
Demo user (ধাপ ৪): `user@example.com` / `admin@example.com` — দুটোর password `password123`।

**ম্যানুয়াল checklist**
| # | কাজ | প্রত্যাশিত |
|---|---|---|
| 1 | logged-out অবস্থায় `/` খোলো | `/login`-এ যায় |
| 2 | logged-out `/dashboard`, `/admin` খোলো | `/login`-এ যায় |
| 3 | ভুল password দিয়ে submit | লাল error বার্তা, redirect নয় |
| 4 | `user@example.com` দিয়ে login | `/dashboard`, "Role: user" |
| 5 | সে `/admin` খুলুক | শেষে `/dashboard`-এ ফেরত |
| 6 | logged-in অবস্থায় `/login` খোলো | `/dashboard`-এ যায় |
| 7 | Sign out চাপো | `/login`-এ যায়; `/dashboard` আবার আটকায় |
| 8 | `admin@example.com` দিয়ে login → `/admin` | admin পাতা দেখা যায় |
| 9 | DevTools → Application → Cookies | `authjs.session-token` আছে, **HttpOnly** টিক; Console-এ `document.cookie` তে সেটা আসে না |

**কোড-মান যাচাই**
```bash
npm run lint
npm run typecheck
npm run build
```

> `npm run start` (production মোড) localhost-এ চালালে `AUTH_TRUST_HOST=true npm run start` দিতে হয়, নইলে `UntrustedHost` error (নিচে সমস্যা-সমাধান)।

---

## ধাপ ১২ — সমস্যা হলে (Troubleshooting)

| লক্ষণ | কারণ | সমাধান |
|---|---|---|
| `MissingSecret` error | `.env.local`-এ `AUTH_SECRET` নেই | `npx auth secret` চালাও, dev server restart |
| `UntrustedHost` (production মোড) | Auth.js অজানা host মানে না | Vercel-এ নিজে ঠিক; অন্যত্র `AUTH_TRUST_HOST=true` |
| সফল login-এ redirect হয় না, ভুল ধরা পড়ে | `catch`-এ সব error ধরা হচ্ছে | শুধু `AuthError` ধরো, বাকিটা `throw error` |
| `token.role` / `session.user.role` type error | JWT augmentation ঠিক module-এ নেই | `"next-auth/jwt"` ↔ `"@auth/core/jwt"` বদলে দেখো (ধাপ ২) |
| `session.user.role` সবসময় `undefined` | `jwt`/`session` callback-এ `role` কপি হয়নি | ধাপ ৫-এর দুই callback মিলিয়ে দেখো; cookie মুছে আবার login |
| `/api/auth/session` 404 | route handler-এর path/নাম ভুল | `app/api/auth/[...nextauth]/route.ts` হুবহু মেলাও |
| প্রতিবার `/login`-এ ফিরে আসছে | cookie বসছে না / `authorized` সবসময় `false` | cookie দেখো; `authorized`-এর path-শর্ত যাচাই |
| Proxy কাজ করছে না | ফাইলের নাম/অবস্থান ভুল | `src/proxy.ts` (Next 15 হলে `middleware.ts`), export `proxy` |
| শুধু `npm i next-auth` করেছি, কিছু মিলছে না | v4 এসেছে | `npm i next-auth@beta` |

---

## ধাপ ১৩ — আসল backend লাগলে

১. `users.ts`-এর `verifyCredentials`-এর ভেতর `fetch` বসাও (ধাপ ৪-এর উদাহরণ)। বাকি কিছু বদলায় না।
২. Backend access token দিলে:
   - `types/next-auth.d.ts`-এ `User`, `Session`, `JWT`-এ `accessToken: string` যোগ
   - `jwt` callback: `if (user) token.accessToken = user.accessToken`
   - `session` callback: `session.accessToken = token.accessToken`
   - API call-এ: `const session = await auth(); fetch(url, { headers: { Authorization: `Bearer ${session?.accessToken}` } })`
৩. Backend API **নিজেও** token ও role যাচাই করবে (frontend-কে বিশ্বাস করে না)।

---

## ধাপ ১৪ — ইচ্ছে করে যা বাদ রাখা হয়েছে

Password hashing (bcrypt/argon2 — backend/DB-র কাজ), rate limiting (brute-force ঠেকাতে), sign-up, email verification, 2FA, OAuth/Google (Auth.js-এ শুধু provider যোগ), refresh token, database adapter, tests।
**ইন্টারভিউতে** এগুলো "পরের ধাপে করতাম" বলতে পারো।

---

## ধাপ ১৫ — পরীক্ষায় দ্রুত রেসিপি (ক্রম মনে রাখো)

```
1. npm i next-auth@beta zod  &&  npx auth secret
2. types/next-auth.d.ts        (role type)
3. lib/auth/login.schema.ts    (Zod)
4. lib/auth/users.ts           (mock → পরে fetch)
5. lib/auth/auth.ts            (NextAuth config: provider + 3 callback)
6. app/api/auth/[...nextauth]/route.ts
7. proxy.ts                    (export { auth as proxy } + matcher)
8. features/auth/actions.ts    (login/logout)
9. LoginForm / LogoutButton
10. pages: login, dashboard, admin, home → প্রতিটিতে auth() check
11. test checklist → lint/typecheck/build
```

## Docs — এক নজরে
| উৎস | লিংক |
|---|---|
| **Learn course (প্রধান)** | https://nextjs.org/learn/dashboard-app/adding-authentication |
| Role-based access (`jwt` + `session`) | https://authjs.dev/guides/role-based-access-control |
| TypeScript / module augmentation | https://authjs.dev/getting-started/typescript |
| Installation + route handler | https://authjs.dev/getting-started/installation?framework=next.js |
| Credentials provider, Zod, Signin Form | https://authjs.dev/getting-started/authentication/credentials |
| Proxy ও page protect | https://authjs.dev/getting-started/session-management/protecting |
| Signin/Signout | https://authjs.dev/getting-started/session-management/login |
| সব config option | https://authjs.dev/reference/nextjs |
| Next.js guide (page/action check, DAL — `jose`-ভিত্তিক) | https://nextjs.org/docs/app/guides/authentication |
| Next.js docs (local, internet ছাড়া) | `node_modules/next/dist/docs/01-app/02-guides/authentication.md` |
| Next.js Proxy (local) | `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md` |
| React `useActionState` | https://react.dev/reference/react/useActionState |
| Zod | https://zod.dev |

> **নোট:** Auth.js এখন Better Auth টিমের রক্ষণাবেক্ষণে (security patch আছে, নতুন feature নেই)। External backend API + frontend-এ database নেই — এই পরিস্থিতিতে Auth.js এখনো সঠিক পছন্দ। নতুন প্রজেক্টে নিজস্ব database থাকলে Better Auth বিবেচনা করো। বিস্তারিত: https://better-auth.com/blog/authjs-joins-better-auth
