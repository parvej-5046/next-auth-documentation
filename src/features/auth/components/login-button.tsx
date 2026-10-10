import Link from "next/link";

import { buttonClass } from "@/components/ui/button";

// A plain link, not a form: signing in happens on the /login page, this only takes you there.
export function LoginButton() {
  return (
    <Link href="/login" className={buttonClass}>
      Sign in
    </Link>
  );
}
