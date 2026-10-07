import type { DefaultSession } from "next-auth";

// Docs (not in the Learn course): https://authjs.dev/getting-started/typescript  ("Module Augmentation")
type Role = "user" | "admin"; // নিজের type, কিছু extend করছি না — তাই plain `type` (union-ও এটাই লাগে)

// Auth.js already declares them in its own types; node_modules/@auth/core/types.d.ts
// export interface DefaultUser {
//   id?: string;
//   name?: string | null;
//   email?: string | null;
//   image?: string | null;
// }
// export interface User extends DefaultUser {}

declare module "next-auth" {
  interface User {
    role: Role; // authorize() যে user ফেরত দেয় তাতে role & // adds one more field
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

/*
────────────────────────── ব্যাখ্যা (বাংলায়) ──────────────────────────
• Auth.js-এর User/Session/JWT type-এ ডিফল্টে `role` নেই। না জানালে `session.user.role` লিখলে error
  (বা `any` লাগত — reference প্রজেক্টে ঠিক তাই ছিল)। এটাকে বলে module augmentation।
• `interface` কেন, `type` নয়? Auth.js-এ User/Session/JWT আগে থেকেই interface। একই নামের interface আবার ঘোষণা
  করলে TypeScript দুটো জুড়ে এক করে (declaration merging)। `type` পুনরায় খোলা যায় না (Duplicate identifier error)।
• `import type` লাইনটাই ফাইলকে "module" বানায়; নইলে `declare module` library-কে প্রসারিত না করে প্রতিস্থাপন করত।
• `& DefaultSession["user"]`: intersection — Auth.js-এর name/email/image রেখে আমাদের id/role যোগ।
• JWT-র module নাম: docs-এ "next-auth/jwt"; কিন্তু beta.32-তে সেটা type-এ কাজ করেনি, "@auth/core/jwt" করেছে।
• এই ফাইলে runtime কোড নেই; শুধু TypeScript-কে তথ্য দেয়।
*/
