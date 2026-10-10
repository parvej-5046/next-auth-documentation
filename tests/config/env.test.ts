import { afterEach, describe, expect, it, vi } from "vitest";

describe("env", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("falls back to localhost when NEXT_PUBLIC_APP_URL is empty", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    const { env } = await import("@/config/env");
    expect(env.NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
  });

  it("throws on an invalid URL", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "not-a-url");
    await expect(import("@/config/env")).rejects.toThrow();
  });
});
