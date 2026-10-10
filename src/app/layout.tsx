import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { siteConfig } from "@/config/site";
import { LoginButton, LogoutButton } from "@/features/auth";
import { auth } from "@/lib/auth/auth";
import { fontVariables } from "@/styles/fonts";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: { default: siteConfig.name, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
};

// Global header: wiring only. Shared Header stays feature-free; app/ picks the button from the session.
// Reading the session here makes every route dynamic. Access checks still live in proxy + pages.
export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await auth();

  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Header actions={session ? <LogoutButton /> : <LoginButton />} />
        {children}
      </body>
    </html>
  );
}
