import { describe, expect, it } from "vitest";

import { verifyCredentials } from "@/lib/auth/users";

describe("verifyCredentials", () => {
  it("returns the user without the password on success", async () => {
    const user = await verifyCredentials("admin@example.com", "password123");
    expect(user).toMatchObject({ email: "admin@example.com", role: "admin" });
    expect(user).not.toHaveProperty("password");
  });

  it("returns null for a wrong password or unknown email", async () => {
    expect(await verifyCredentials("admin@example.com", "wrong")).toBeNull();
    expect(await verifyCredentials("ghost@example.com", "password123")).toBeNull();
  });
});
