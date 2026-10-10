import { describe, expect, it } from "vitest";

import { loginSchema } from "@/lib/auth/login.schema";

describe("loginSchema", () => {
  it("trims and lowercases the email", () => {
    const result = loginSchema.parse({ email: "  A@X.com ", password: "secret" });
    expect(result.email).toBe("a@x.com");
  });

  it("rejects an invalid email", () => {
    expect(loginSchema.safeParse({ email: "nope", password: "secret" }).success).toBe(false);
  });

  it("rejects an empty password", () => {
    expect(loginSchema.safeParse({ email: "a@x.com", password: "" }).success).toBe(false);
  });
});
