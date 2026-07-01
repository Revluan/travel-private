import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  const result = await sql`SELECT 1 as ok`;
  console.log("db smoke result:", JSON.stringify(result));
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
