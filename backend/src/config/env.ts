import dotenv from "dotenv";
dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

/** Throws at startup if a required env var is missing — fail fast, don't run with broken config. */
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `[Config] Required environment variable "${key}" is not set. Add it to your .env file.`
    );
  }
  return value;
}

/**
 * Returns the env var or its default.
 * In production, throws if the default is an insecure placeholder.
 * In development, logs a warning so the problem is visible.
 */
function sensitiveEnv(key: string, insecureDefault: string): string {
  const value = process.env[key];
  if (!value) {
    if (isProduction) {
      throw new Error(
        `[Config] "${key}" must be explicitly set in production. Do not rely on insecure defaults.`
      );
    }
    console.warn(
      `\x1b[33m[WARN] "${key}" is using an insecure default. Set it in your .env file before going to production.\x1b[0m`
    );
    return insecureDefault;
  }
  return value;
}

export const env = {
  PORT: Number(process.env.PORT) || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: requireEnv("DATABASE_URL"),

  // JWT Secrets — insecure defaults allowed only in development
  JWT_ACCESS_SECRET: sensitiveEnv("JWT_ACCESS_SECRET", "access-secret-change-me"),
  JWT_REFRESH_SECRET: sensitiveEnv("JWT_REFRESH_SECRET", "refresh-secret-change-me"),

  // JWT Expiry
  JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY || "15m",
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || "7d",

  // Bcrypt salt rounds
  BCRYPT_SALT_ROUNDS: Number(process.env.BCRYPT_SALT_ROUNDS) || 12,

  // Admin seed email
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "admin@oshadhi.com",
  ADMIN_PASSWORD: requireEnv("ADMIN_PASSWORD"),

  // Agora — always required (app can't function without them)
  AGORA_APP_ID: requireEnv("APP_ID"),
  AGORA_APP_CERTIFICATE: requireEnv("APP_CERTIFICATE"),

  // CORS — restrict to frontend origin in production
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
};
