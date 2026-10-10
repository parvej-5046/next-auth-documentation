# Build this project from scratch — step-by-step guide

Written for: future me, opening this repo after a long break. Follow the steps in order.

**What you will end up with:** a Next.js 16 app with a feature-based architecture and role-based
login (Auth.js credentials). Roles: `user` and `admin`.

**Stack:** Next.js 16 (App Router) · React 19 · Auth.js v5 beta · Zod 4 · Tailwind v4 · Vitest · ESLint.

**How to use this guide**
- Steps are numbered `Step N` and sub-steps `N.1`, `N.2`. Do them in order; each step only depends on earlier ones.
- Finished code lives in git history (`git log --oneline`). Recover any file with `git show <commit>:<path>`.
- Next.js 16 differs from older versions. Before coding, skim `node_modules/next/dist/docs/`.

---

## Step 0 — Learn the target first (5 minutes)

### 0.1 The final tree

```
play-with-next-auth/
├── src/
│   ├── app/                               ROUTING ONLY
│   │   ├── layout.tsx · page.tsx · error.tsx · global-error.tsx · not-found.tsx
│   │   ├── favicon.ico · robots.ts · sitemap.ts
│   │   ├── (auth)/login/page.tsx          /login       public
│   │   ├── (protected)/
│   │   │   ├── loading.tsx
│   │   │   ├── dashboard/page.tsx         /dashboard   any logged-in user
│   │   │   └── admin/page.tsx             /admin       admin only
│   │   └── api/auth/[...nextauth]/route.ts
│   ├── features/auth/                     BUSINESS LOGIC
│   │   ├── actions.ts · index.ts
│   │   └── components/ login-form.tsx · login-button.tsx · logout-button.tsx
│   ├── components/                        SHARED UI
│   │   ├── layout/header.tsx
│   │   └── ui/button.tsx
│   ├── lib/auth/                          SHARED INFRASTRUCTURE
│   │   └── auth.ts · login.schema.ts · users.ts
│   ├── config/    env.ts · site.ts
│   ├── styles/    globals.css · fonts.ts
│   ├── types/     next-auth.d.ts
│   └── proxy.ts                           route guard (Next 16's "middleware")
├── tests/                                 mirrors src/
├── public/                                fonts · icons · images · videos
├── docs/
└── eslint.config.mjs · vitest.config.mts · tsconfig.json · next.config.ts
    postcss.config.mjs · .env.example · package.json
```

### 0.2 The one arrow

```
app/  ──▶  features/  ──▶  components · lib · hooks · config · types · styles
```

### 0.3 The eight rules

1. `app/` is routing only. It wires things; it holds no business logic.
2. Business logic lives in `features/<name>/`. This is the default home for new code.
3. Move code to a shared folder only when a **second** feature needs it.
4. A feature never imports another feature. Shared code never imports `features/` or `app/`.
5. Outside code imports a feature only through `@/features/<name>` (its `index.ts`).
6. Every file and folder is `kebab-case`. The components inside are `PascalCase`.
7. There is one helper folder: `lib/`. Never `utils/`, `helpers/`, `common/`, `services/` at the top level.
8. Create a folder only when its first real file arrives (git does not track empty folders).

**One exception to remember:** the Auth.js config lives in `lib/auth/`, not in the feature. `proxy.ts`,
the route handler and every page call `auth()`, and shared code may not import a feature.

### 0.4 Full architecture flowcharts

**A. Layers and who may import whom** (arrows = "is allowed to import")

```
                          ┌────────────────────────────┐
                          │  src/app/   (ROUTING ONLY) │
                          │  pages · layouts · route.ts│
                          │  proxy.ts (next to app/)   │
                          └─────────────┬──────────────┘
                                        │ imports (via index.ts only)
                                        ▼
                          ┌────────────────────────────┐
                          │ src/features/<name>/       │
                          │ BUSINESS LOGIC             │
                          │ actions · components ·     │
                          │ hooks · schemas · api      │
                          └─────────────┬──────────────┘
          ✗ never imports another feature│ imports freely
                                        ▼
   ┌──────────────┬───────────┬──────────┬───────────┬──────────┬──────────┬────────┐
   │ components/  │   lib/    │  hooks/  │ providers/│  store/  │  config/ │ types/ │
   │ ui · layout  │ auth· api │  shared  │           │          │  styles/ │        │
   └──────────────┴───────────┴──────────┴───────────┴──────────┴──────────┴────────┘
                SHARED LAYERS — never import from features/ or app/

   app/ also imports shared layers directly (e.g. root layout → components/layout/header)
```

**B. How this project is wired (real files)**

```
 Browser
    │
    ▼
 proxy.ts ───────────────► lib/auth/auth.ts  (authorized callback decides)
    │                               ▲   ▲   ▲
    │ allowed                       │   │   │
    ▼                               │   │   │
 app/layout.tsx ── await auth() ────┘   │   │
    │   └─ <Header actions={LoginButton | LogoutButton}>      components/layout/header.tsx
    ▼                                   │   │
 app/(auth)/login/page.tsx              │   │
    └─ <LoginForm/> ◄── features/auth ──┘   │   (imported via features/auth/index.ts)
 app/(protected)/dashboard/page.tsx ─ await auth()
 app/(protected)/admin/page.tsx     ─ await auth() + role check
 app/api/auth/[...nextauth]/route.ts ─ handlers ─────────┘

 features/auth/actions.ts ─► lib/auth/auth.ts ─► login.schema.ts + users.ts
```

**C. Every request: route protection**

```
 Request ─► proxy.ts ─► authorized() in lib/auth/auth.ts
                              │
         ┌────────────────────┼─────────────────────────────┐
         ▼                    ▼                             ▼
   /admin*              /dashboard*                  /login  or anything else
   role == admin?       logged in?                   logged in & /login?
     yes → continue       yes → continue               yes → redirect /dashboard
     no  → /login         no  → /login                 no  → continue (public)
         │                    │                             │
         └────────────────────┴──────────────┬──────────────┘
                                             ▼
                          Page (server component) runs `await auth()` AGAIN
                          no session → redirect("/login")
                          admin page: role != admin → redirect("/dashboard")
                                             ▼
                                      Page renders
```

**D. Login flow**

```
 /login page
    │  renders
    ▼
 <LoginForm>  ("use client", useActionState)
    │  submit (email, password)
    ▼
 features/auth/actions.ts  login()   ["use server"]
    │  signIn("credentials", ...)
    ▼
 lib/auth/auth.ts  authorize()
    │  1. loginSchema.safeParse(...)         ── invalid ─► null
    │  2. verifyCredentials(email, password) ── no match ─► null
    ▼                       │
  User found                │ null
    │                       ▼
    │            AuthError caught in login()
    │            returns "Incorrect email or password." ─► shown in the form
    ▼
 jwt callback     → put id + role in the token
 session callback → expose id + role on the session
    ▼
 httpOnly cookie is set ─► redirect to /dashboard
```

**E. Logout flow**

```
 <LogoutButton>  (<form action={logout}>, POST)
    ▼
 features/auth/actions.ts  logout()
    ▼
 signOut({ redirectTo: "/login" })  ─► cookie deleted ─► /login
```

**F. "Where does this new file go?"**

```
 New file
    │
    ├─ Route, layout or HTTP handler? ───────────────► src/app/
    │
    ├─ Belongs to ONE business domain? ──────────────► src/features/<name>/<subfolder>/   (DEFAULT)
    │
    ├─ Needed by a SECOND feature now?
    │        ├─ UI ──────────────────────────────────► src/components/{ui|layout|forms|shared}/
    │        └─ anything else ───────────────────────► src/lib/{api|auth|utils|constants}/
    │
    ├─ App-wide configuration / env? ────────────────► src/config/
    ├─ Global type or *.d.ts? ───────────────────────► src/types/
    ├─ Global CSS / fonts? ──────────────────────────► src/styles/
    ├─ Context provider for the root layout? ────────► src/providers/
    ├─ Shared hook (used by 2+ features)? ───────────► src/hooks/
    ├─ Static asset? ────────────────────────────────► public/
    └─ Test? ────────────────────────────────────────► tests/  (mirror the source path)
```

---

## Step 1 — Create the project

### 1.1 Run the generator

```bash
npx create-next-app@latest play-with-next-auth \
  --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
cd play-with-next-auth
```

Flag meanings: TypeScript, Tailwind, ESLint, App Router, `src/` directory, alias `@/*` → `./src/*`.

> This repo was built on `next@16.3.2`. `@latest` today gives a newer 16.x and may differ slightly
> (for example it may use `@tailwindcss/turbopack` instead of `@tailwindcss/postcss`, and add
> `babel-plugin-react-compiler`). Everything in this guide still applies. To match this repo exactly,
> pin the versions in `package.json`.

### 1.2 What the generator gives you (the "scratch" files)

```
.gitignore · AGENTS.md · README.md · eslint.config.mjs · next-env.d.ts
next.config.ts · package.json · tsconfig.json · (postcss.config.mjs on some versions)
public/    file.svg · globe.svg · next.svg · vercel.svg · window.svg
src/app/   favicon.ico · globals.css · layout.tsx · page.tsx
```

The generator also runs `git init` and makes a first commit.

### 1.3 Check the alias

Open `tsconfig.json` and confirm there is exactly **one** alias:

```json
"paths": { "@/*": ["./src/*"] }
```

Never add a second alias.

---

## Step 2 — Clean the scratch files

The generator's layout does not match the architecture. Fix it now, before adding code.

### 2.1 Delete what you will not use

| File | Action |
|---|---|
| `public/file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` | Delete (demo-page assets) |
| the demo markup inside `src/app/page.tsx` | Replace with a simple page (Step 9.4) |
| `README.md` | Rewrite later; keep the file |

### 2.2 Move styles out of `app/`

`app/` is routing only, so styles get their own folder.

```bash
mkdir -p src/styles
git mv src/app/globals.css src/styles/globals.css
```

### 2.3 Move the fonts out of `layout.tsx`

The scratch `layout.tsx` declares Geist fonts inline. Move them to `src/styles/fonts.ts`:

```ts
import { Geist, Geist_Mono } from "next/font/google";

export const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
export const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

/** Applied on <html> so every font variable is available to Tailwind. */
export const fontVariables = `${geistSans.variable} ${geistMono.variable}`;
```

Then `layout.tsx` imports `fontVariables` from `@/styles/fonts` and `@/styles/globals.css`
(final version in Step 9.3).

### 2.4 Keep these where they are

`favicon.ico` stays in `src/app/` (Next.js reads it from there). `next.config.ts`, `tsconfig.json`,
`eslint.config.mjs` stay at the root.

### 2.5 Git: allow `.env.example`

The generator's `.gitignore` ignores every `.env*` file. Add one line so the template is tracked:

```gitignore
.env*
!.env.example
```

If you want docs tracked, note that this repo also ignores `*.md` (README is whitelisted). Whitelist
any doc you want committed, for example `!docs/architecture-setup-guide.md`.

### 2.6 Commit

```bash
git add -A && git commit -m "chore: initial project scaffold"
```

---

## Step 3 — Create the architecture skeleton

### 3.1 Create the shared layers

Run once. These folders hold code that is not specific to one feature.

```bash
cd src
mkdir -p features components/ui components/layout components/forms components/shared \
         providers hooks store config types \
         lib/api lib/auth lib/utils lib/constants
cd ..
mkdir -p tests docs public/images public/icons public/fonts public/videos
```

Git ignores empty folders, so nothing appears in `git status` until a file lands. That is expected.
You do not need to keep folders you will not use. Delete unused ones, or create them later.

### 3.2 What each folder is for

| Folder | Holds | Example file | Create it when |
|---|---|---|---|
| `src/app/` | Routes, layouts, route handlers | `app/(auth)/login/page.tsx` | Always |
| `src/features/<name>/` | One business domain, everything it needs | `features/auth/actions.ts` | First feature |
| `src/components/ui/` | Design-system primitives | `ui/button.tsx` | 2+ features need a primitive |
| `src/components/layout/` | App chrome | `layout/header.tsx` | You build a header or sidebar |
| `src/components/forms/` | Shared form fields | `forms/text-field.tsx` | Two forms share a field |
| `src/components/shared/` | Pagination, empty state, error boundary | `shared/empty-state.tsx` | Two features need it |
| `src/hooks/` | Shared hooks only | `hooks/use-debounce.ts` | A second feature needs a hook |
| `src/providers/` | Context providers mounted in the root layout | `providers/theme-provider.tsx` | You need global context |
| `src/store/` | Root store (if you use Redux/Zustand) | `store/store.ts` | You need global client state |
| `src/lib/api/` | HTTP client, fetcher | `lib/api/client.ts` | You call a real backend |
| `src/lib/auth/` | Auth.js config and its helpers | `lib/auth/auth.ts` | Auth is needed |
| `src/lib/utils/` | Plain helpers (this is where "utils" lives) | `utils/cn.ts`, `utils/date.ts` | Two places need a helper |
| `src/lib/constants/` | Frozen values | `constants/payment-methods.ts` | You have shared constants |
| `src/config/` | `env.ts` (validated), `site.ts`, `navigation.ts` | `config/env.ts` | Always |
| `src/styles/` | Global CSS, fonts | `styles/globals.css` | Always |
| `src/types/` | Global types and `*.d.ts` | `types/next-auth.d.ts` | You have a global type |
| `tests/` | Mirrors `src/` exactly | `tests/lib/auth/users.test.ts` | First test |
| `docs/` | Documentation | this file | Always |
| `public/` | Static assets only | `public/images/logo.png` | Always |

### 3.3 Inside a feature

A feature only gets the subfolders it needs today:

```
src/features/<feature-name>/
├── api/          <feature-name>.api.ts   endpoints + query keys
├── actions.ts    "use server" mutations (directive on line 1)
├── components/   kebab-case.tsx          feature-private UI
├── hooks/        use-<thing>.ts
├── schemas/      <subject>.schema.ts
├── store/        <feature-name>.slice.ts  only if global state
├── utils/        kebab-case.ts
├── types.ts      feature-private types
└── index.ts      PUBLIC SURFACE — outside code imports only this
```

### 3.4 Forbidden folders

Never create `core/`, a top-level `utils/`, `helpers/`, `common/`, `misc/`, `services/`, `containers/`.
Helpers go in `src/lib/`. A file used by only one feature stays inside that feature.

### 3.5 Naming cheat sheet

| Thing | Rule | Example |
|---|---|---|
| Any file or folder | `kebab-case` | `login-form.tsx` |
| Component export | `PascalCase` | `LoginForm` |
| Hook | file `use-x.ts`, export `useX` | `use-debounce.ts` → `useDebounce` |
| Schema | `<subject>.schema.ts` exporting `<subject>Schema` | `login.schema.ts` → `loginSchema` |
| API module | `<feature>.api.ts` | `payments.api.ts` |
| Constants | file kebab-case, values `SCREAMING_SNAKE_CASE` | `payment-methods.ts` |
| Type / interface | `PascalCase`, no `I`/`T` prefix | `Payment` |
| Props type | `<Component>Props` | `PaymentCardProps` |
| Test file | mirrors source path under `tests/` | `tests/lib/utils/date.test.ts` |
| Barrel `index.ts` | only at a feature root | `features/auth/index.ts` |
| Route folder | kebab-case, `[id]`, `(group)` | `make-payment/` |

`.tsx` only when the file contains JSX; otherwise `.ts`. Next.js special files (`page.tsx`,
`layout.tsx`, `route.ts`) keep their fixed names.

---

## Step 4 — Decide what auth needs (folders and file moves)

Auth touches four places. This step creates the folders and says where every file will go.

### 4.1 Create the auth folders

```bash
mkdir -p "src/app/(auth)/login" \
         "src/app/(protected)/dashboard" \
         "src/app/(protected)/admin" \
         "src/app/api/auth/[...nextauth]" \
         src/features/auth/components \
         src/lib/auth
```

- `(auth)` and `(protected)` are **route groups**. Parentheses mean they organize files but do not
  appear in the URL (`/login`, not `/auth/login`).
- `[...nextauth]` is a catch-all. The name must be exactly that.

### 4.2 Where each auth file goes

| File | Location | Why there |
|---|---|---|
| `auth.ts` (Auth.js config) | `src/lib/auth/` | Used by proxy, route handler, pages and actions |
| `login.schema.ts` | `src/lib/auth/` | Used by `auth.ts`; shared code cannot import a feature |
| `users.ts` (mock user store) | `src/lib/auth/` | Used by `auth.ts` |
| `next-auth.d.ts` (types) | `src/types/` | Global type augmentation |
| `actions.ts` (login, logout) | `src/features/auth/` | Auth-specific mutations |
| `login-form.tsx`, `login-button.tsx`, `logout-button.tsx` | `src/features/auth/components/` | Auth-specific UI |
| `index.ts` | `src/features/auth/` | The feature's public door |
| `route.ts` | `src/app/api/auth/[...nextauth]/` | HTTP handler, wiring only |
| `proxy.ts` | `src/` (next to `app/`) | Next 16 name for middleware |
| `login/page.tsx` | `src/app/(auth)/login/` | Public route |
| `dashboard/page.tsx`, `admin/page.tsx` | `src/app/(protected)/...` | Protected routes |

### 4.3 Why the Auth.js config is not in the feature

Pages, `proxy.ts` and the route handler all need `auth()`. Rule 4 says shared code cannot import a
feature, so the config is shared infrastructure in `lib/auth/`. This is the only intentional exception.

---

## Step 5 — Install dependencies and scripts

### 5.1 Install

```bash
npm install next-auth@beta zod
npm install -D vitest eslint-plugin-import eslint-import-resolver-typescript eslint-plugin-check-file
```

### 5.2 Add scripts to `package.json`

```json
"lint": "eslint",
"lint:fix": "eslint --fix",
"typecheck": "tsc --noEmit",
"test": "vitest run",
"test:watch": "vitest"
```

---

## Step 6 — Environment and site config

### 6.1 `.env.example` (committed) and `.env.local` (not committed)

```
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Read by Auth.js itself. Generate with: npx auth secret   (or: openssl rand -base64 32)
AUTH_SECRET=
```

Copy it: `cp .env.example .env.local`, then run `npx auth secret` so `AUTH_SECRET` has a value.
Without it login fails.

### 6.2 `src/config/env.ts` — the only file that reads `process.env`

```ts
import * as z from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),
});

// List each variable explicitly: Next.js only inlines NEXT_PUBLIC_* values it can see statically.
// AUTH_SECRET is absent on purpose — Auth.js reads it from the environment itself.
export const env = envSchema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || undefined,
});
```

Rule: add every new variable to `.env.example` and to `env.ts`.

### 6.3 `src/config/site.ts`

```ts
export const siteConfig = {
  name: "Play with Next Auth",
  description: "Role-based authentication with Next.js and Auth.js.",
} as const;
```

---

## Step 7 — Enforce the architecture with ESLint

Do this before writing features, so the rules protect you from day one. Edit `eslint.config.mjs`.

### 7.1 Keep the generator's base

`eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`.

### 7.2 Dependency law — `import/no-restricted-paths`

Add zones for:

1. A feature may not import another feature. Generate one zone per folder in `src/features/` by
   reading the directory when ESLint starts, so new features are covered automatically.
2. Shared layers (`components`, `hooks`, `lib`, `providers`, `store`, `types`, `config`, `styles`)
   may not import `./src/features` or `./src/app`.
3. `app/` may not import `./src/store` directly.

### 7.3 Public surface — `no-restricted-imports`

- Ban `@/features/*/*`: import a feature only through `@/features/<name>`.
- Ban `../../*`: relative imports may not leave the current feature.
- Inside `src/features/**` keep only the first ban (relative imports are normal there).

### 7.4 Naming law — `eslint-plugin-check-file`

- Files: `KEBAB_CASE` for `src/**/*.{ts,tsx}`, ignoring `*.d.ts`.
- Folders: kebab-case, plus Next.js route syntax `(group)`, `[id]`, `[...slug]`.

The complete working file is `eslint.config.mjs` in this repo — copy it.

### 7.5 Prove the rules work

```bash
echo 'export const a = 1;' > src/BadName.ts && npm run lint   # must fail
rm src/BadName.ts
```

---

## Step 8 — Test setup

### 8.1 `vitest.config.mts`

```ts
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: { environment: "node", include: ["tests/**/*.test.ts"] },
});
```

The `@` alias must mirror `tsconfig.json`, otherwise imports in tests fail.

### 8.2 Layout

`tests/` mirrors `src/`: the test for `src/lib/auth/users.ts` is `tests/lib/auth/users.test.ts`.

---

## Step 9 — Styles and root layout

### 9.1 `src/styles/globals.css`

```css
@import "tailwindcss";

:root { --background: #ffffff; --foreground: #171717; }

@media (prefers-color-scheme: dark) {
  :root { --background: #0a0a0a; --foreground: #ededed; }
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

body { background: var(--background); color: var(--foreground); font-family: var(--font-sans); }
```

Tailwind v4 is CSS-first: there is **no** `tailwind.config.ts`. Theme tokens live in `@theme`.

### 9.2 Postcss

If your generator version created `postcss.config.mjs`, keep it:
`{ plugins: { "@tailwindcss/postcss": {} } }`.

### 9.3 Root layout (first version, without auth)

```tsx
import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { fontVariables } from "@/styles/fonts";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: { default: siteConfig.name, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
```

`LayoutProps<"/">` is a global type Next 16 generates.

### 9.4 Replace the demo `page.tsx`

Render a heading with `siteConfig.name` and the description. Auth links come in Step 14.

---

## Step 10 — Auth core in `src/lib/auth/` (order matters)

Build bottom-up so each file only needs files that already exist.

### 10.1 Types — `src/types/next-auth.d.ts`

Auth.js has no `role` by default. Add it by module augmentation:

```ts
import type { DefaultSession } from "next-auth";

type Role = "user" | "admin";

declare module "next-auth" {
  interface User { role: Role }
  interface Session { user: { id: string; role: Role } & DefaultSession["user"] }
}

declare module "@auth/core/jwt" {
  interface JWT { id: string; role: Role }
}
```

Gotchas: the `import type` line makes the file a module — without it, `declare module` *replaces*
the library types instead of extending them. In `next-auth@5.0.0-beta.32` the JWT module name that
works is `@auth/core/jwt`, not `next-auth/jwt`.

### 10.2 Validation — `login.schema.ts`

```ts
import * as z from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()), // normalize first, then validate
  password: z.string().min(1),
});
```

Order matters: `z.email().trim()` validates before trimming and rejects `" a@x.com "`.

### 10.3 Mock user store — `users.ts`

Export `verifyCredentials(email, password): Promise<User | null>` over a small in-memory list:
`user@example.com` (role `user`) and `admin@example.com` (role `admin`), both `password123`.
Strip the password before returning. Return `null` for both "no such email" and "wrong password" so
an attacker cannot tell which one failed.

In production, replace the inside of this function with a real API/DB call using hashed passwords.
The signature stays the same.

### 10.4 Auth.js config — `auth.ts`

```ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "./login.schema";
import { verifyCredentials } from "./users";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials); // never trust client input
        if (!parsed.success) return null;
        return verifyCredentials(parsed.data.email, parsed.data.password);
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {             // `user` exists only at login time
      if (user) { token.id = user.id as string; token.role = user.role; }
      return token;
    },
    session({ session, token }) {      // expose id/role to auth()
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
    authorized({ auth: session, request: { nextUrl } }) {   // runs inside proxy.ts
      const { pathname } = nextUrl;
      const user = session?.user;
      if (pathname.startsWith("/admin")) return user?.role === "admin";
      if (pathname.startsWith("/dashboard")) return !!user;
      if (pathname === "/login" && user) return Response.redirect(new URL("/dashboard", nextUrl));
      return true;                     // everything else is public
    },
  },
});
```

---

## Step 11 — Wire Auth.js into Next.js

### 11.1 Route handler — `src/app/api/auth/[...nextauth]/route.ts`

```ts
import { handlers } from "@/lib/auth/auth";

export const { GET, POST } = handlers;
```

Check: open `http://localhost:3000/api/auth/session` — logged out it shows `null`.

### 11.2 Proxy — `src/proxy.ts`

Next 16 name. On Next 15 or older the file is `middleware.ts`.

```ts
export { auth as proxy } from "@/lib/auth/auth";

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
```

The proxy is a fast, optimistic check. The real protection is `await auth()` inside each protected
page. Keep both (defense in depth).

---

## Step 12 — The auth feature (`src/features/auth/`)

### 12.1 `actions.ts` — line 1 must be `"use server"`

```ts
"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth/auth";

export async function login(_previousState: string | undefined, formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) return "Incorrect email or password.";
    throw error; // a successful signIn redirects BY THROWING — you must re-throw
  }
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}
```

### 12.2 Components in `components/`

| File | What it is |
|---|---|
| `login-form.tsx` | `"use client"`; `useActionState(login, undefined)`; inputs named `email` and `password`; shows the returned error with `role="alert"`; submit disabled while pending |
| `login-button.tsx` | A `<Link href="/login">` styled like a button (a link, not a form) |
| `logout-button.tsx` | `<form action={logout}>` with a submit button. POST, not a GET link, so nobody can log you out with an `<img>` |

### 12.3 `index.ts` — the public door

```ts
export { LoginForm } from "./components/login-form";
export { LoginButton } from "./components/login-button";
export { LogoutButton } from "./components/logout-button";
```

`actions.ts` stays private. Outside code imports `@/features/auth`, never a deeper path.

---

## Step 13 — Shared UI (`src/components/`)

These files exist because the auth buttons and the header are used across pages.

### 13.1 `ui/button.tsx` — one style, no variants

```tsx
import type { ButtonHTMLAttributes } from "react";

export const buttonClass =
  "rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background disabled:opacity-60";

export function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={buttonClass} {...props} />;
}
```

`buttonClass` is exported because `login-button.tsx` is a `<Link>`, which cannot sit inside a `<button>`.
Use `<Button>` in `login-form.tsx` and `logout-button.tsx`.

### 13.2 `layout/header.tsx` — takes an `actions` slot, knows nothing about auth

```tsx
import type { ReactNode } from "react";
import { siteConfig } from "@/config/site";

export function Header({ actions }: { actions?: ReactNode }) {
  return (
    <header className="flex items-center justify-between border-b border-foreground/10 px-6 py-3">
      <span className="text-sm font-semibold">{siteConfig.name}</span>
      {actions}
    </header>
  );
}
```

Why a slot? `components/` may not import `features/`. So `app/` places the auth button into the header.

---

## Step 14 — Pages (the routing layer)

### 14.1 Root layout becomes session-aware

```tsx
export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await auth();   // from "@/lib/auth/auth"
  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Header actions={session ? <LogoutButton /> : <LoginButton />} />
        {children}
      </body>
    </html>
  );
}
```

Reading the session here makes every route dynamic. That is expected for a session-aware header.

### 14.2 Page table

| Route | File | Content |
|---|---|---|
| `/` | `app/page.tsx` | Public landing; link to `/dashboard` when logged in |
| `/login` | `app/(auth)/login/page.tsx` | `<LoginForm />` plus the demo credentials hint |
| `/dashboard` | `app/(protected)/dashboard/page.tsx` | `const session = await auth(); if (!session) redirect("/login");` then show name and role; link to `/admin` for admins |
| `/admin` | `app/(protected)/admin/page.tsx` | Same, plus `if (session.user.role !== "admin") redirect("/dashboard")` |

Page files stay thin (limit: 100 lines). They import features through `@/features/auth`.

---

## Step 15 — Error, loading and SEO files

| File | Notes |
|---|---|
| `app/error.tsx` | `"use client"`; receives `retry` (Next 16 — not `reset`) |
| `app/global-error.tsx` | `"use client"`; renders its own `<html>`/`<body>`; receives `retry` |
| `app/not-found.tsx` | Message plus link home |
| `app/(protected)/loading.tsx` | "Loading…" with `role="status"` |
| `app/robots.ts` | Disallow `/dashboard` and `/admin`; sitemap URL from `env.NEXT_PUBLIC_APP_URL` |
| `app/sitemap.ts` | `/` and `/login`, URLs from `env.NEXT_PUBLIC_APP_URL` |

---

## Step 16 — Write the tests

| File | Cases |
|---|---|
| `tests/config/env.test.ts` | Default URL; rejects an invalid URL (use `vi.stubEnv`, re-import the module) |
| `tests/lib/auth/login.schema.test.ts` | Trims and lowercases the email; rejects a malformed email; rejects an empty password |
| `tests/lib/auth/users.test.ts` | Valid login returns the user without `password`; wrong password and unknown email return `null` |

---

## Step 17 — Verify

### 17.1 Automated gate (run before every commit)

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

If `typecheck` complains about a file under `.next/types/` that you deleted, run `npm run build` once
to regenerate it.

### 17.2 Manual check — `npm run dev`

1. Logged out: `/dashboard` redirects to `/login`; the header shows **Sign in**.
2. `user@example.com` / `password123`: lands on `/dashboard`; header shows **Sign out**; `/admin` bounces to `/dashboard`.
3. `admin@example.com` / `password123`: `/admin` opens.
4. Wrong password: "Incorrect email or password."
5. `/api/auth/session` shows `null` when logged out.

---

## Step 18 — Commit in small, meaningful pieces

1. `chore: initial project scaffold`
2. `feat: add Auth.js credentials authentication with role-based protection`
3. `fix(auth): trim and lowercase email before validating it`
4. `feat: add validated env config, robots, sitemap and protected loading state`
5. `refactor: enforce kebab-case file and folder names with ESLint`
6. `test: add Vitest with unit tests for env config, login schema and credentials`
7. `feat: add shared Button primitive and use it in auth components`
8. `feat(auth): add global header with sign-in/sign-out button`

Never push without checking `git status` and `git log` first.

---

## Step 19 — Add the next feature (repeatable recipe)

1. Create `src/features/<name>/` with only the subfolders you need right now (Step 3.3).
2. UI in `components/`, mutations in `actions.ts`, Zod schemas in `schemas/`, endpoints in
   `api/<name>.api.ts`. Re-export the public pieces from `index.ts`.
3. Add a thin page in `src/app/` that imports from `@/features/<name>`.
4. Need something from another feature? Don't import it. Move it to `components/` or `lib/` (now it has
   a second user), or have `app/` compose the two.
5. Add a mirrored test under `tests/`, then run the gate in Step 17.1.

### Where does a new file go? (decision list)

1. Route, layout or HTTP handler? → `src/app/`.
2. Belongs to one business domain? → `src/features/<name>/` in the matching subfolder. **Default.**
3. Already used by a second feature? → `src/components/` (UI) or `src/lib/` (everything else).
4. App-wide configuration? → `src/config/`. Global type? → `src/types/`.

---

## Appendix — Known limits (not done on purpose)

- `users.ts` holds plain-text mock passwords; replace with a real API/DB and hashed passwords.
- No CI pipeline, Prettier or Git hooks yet.
- File-size budgets (route 100, component 250, hook/util 150, slice 200 lines) are a convention, not enforced.
