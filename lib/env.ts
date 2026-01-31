import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required"),
  EMAIL_SERVER_HOST: z.string().optional(),
  EMAIL_SERVER_PORT: z.string().optional(),
  EMAIL_SERVER_USER: z.string().optional(),
  EMAIL_SERVER_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().email("EMAIL_FROM must be an email address").optional(),
  DASHBOARD_HOST: z.string().default("stolyo.com"),
  ADMIN_API_KEY: z.string().optional(),
  R2_ENDPOINT: z.string().optional(),
  R2_BUCKET: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_PUBLIC_BASE_URL: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

/**
 * Lazy env parsing.
 * - Avoids throwing during Next.js build-time module evaluation.
 * - Still fails fast at runtime when a server route/action actually needs env.
 */
export const env = (): Env => {
  cached ??= envSchema.parse(process.env);
  return cached;
};
