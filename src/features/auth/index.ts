export { LoginForm } from "./components/login-form";
export { LoginButton } from "./components/login-button";
export { LogoutButton } from "./components/logout-button";

/*
────────────────────────── ব্যাখ্যা (বাংলায়) ──────────────────────────
• এটা feature-এর "সামনের দরজা" (public surface)। বাইরের কোড শুধু `@/features/auth` থেকে import করবে;
  ভেতরের ফাইল (actions ইত্যাদি) লুকানো থাকে। ESLint এই নিয়ম জোর করে মানায়।
• লাভ: ভেতরে যা খুশি বদলাও, বাইরের কেউ ভাঙবে না।
*/
