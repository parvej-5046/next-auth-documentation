import type { ReactNode } from "react";

import { siteConfig } from "@/config/site";

interface HeaderProps {
  /** Right-aligned slot. The caller (app/) decides what goes here, so Header stays feature-free. */
  actions?: ReactNode;
}

export function Header({ actions }: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-foreground/10 px-6 py-3">
      <span className="text-sm font-semibold">{siteConfig.name}</span>
      {actions}
    </header>
  );
}
