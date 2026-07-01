// Test helper: verify lib/env.ts fail-fast on missing var.
// Run with: node --experimental-strip-types --no-warnings scripts/check-env.ts
import { spawnSync } from "node:child_process";

const REQUIRED_VARS = [
  "DATABASE_URL",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "NEXT_PUBLIC_CLERK_SIGN_IN_URL",
  "NEXT_PUBLIC_CLERK_SIGN_UP_URL",
  "NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL",
  "NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL",
  "DEEPSEEK_API_KEY",
];

const BASE_ENV: Record<string, string> = {
  PATH: process.env.PATH ?? "",
  HOME: process.env.HOME ?? "",
  // Provide defaults so only the missing var triggers
  DATABASE_URL: "postgres://u:p@h.neon.tech/d",
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_x",
  CLERK_SECRET_KEY: "sk_test_x",
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: "/sign-in",
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: "/sign-up",
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: "/app",
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: "/app",
  DEEPSEEK_API_KEY: "sk-x",
};

function checkMissing(varName: string) {
  const env: NodeJS.ProcessEnv = { ...BASE_ENV } as unknown as NodeJS.ProcessEnv;
  delete env[varName];
  const result = spawnSync(
    "node",
    ["--experimental-strip-types", "--no-warnings", "-e", "import('./lib/env.ts')"],
    { env, encoding: "utf-8" }
  );
  const ok =
    result.status !== 0 && result.stderr.includes(varName);
  console.log(`${ok ? "✓" : "✗"} missing ${varName} → exit ${result.status}, stderr mentions ${varName}`);
  return ok;
}

let allOk = true;
for (const v of REQUIRED_VARS) {
  if (!checkMissing(v)) allOk = false;
}

process.exit(allOk ? 0 : 1);
