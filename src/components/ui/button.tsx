import type { ButtonHTMLAttributes } from "react";

// Also used by <Link> where something must look like a button.
export const buttonClass =
  "rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background disabled:opacity-60";

export function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={buttonClass} {...props} />;
}
