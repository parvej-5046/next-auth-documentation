import * as z from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),
});

// Each variable is listed explicitly: Next.js only inlines NEXT_PUBLIC_* values it can see statically.
// AUTH_SECRET is deliberately absent — Auth.js reads it from the environment itself.
export const env = envSchema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || undefined,
});
