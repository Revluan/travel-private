import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db/client";
import { trips } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const list = await db.query.trips.findMany({
    where: eq(trips.userId, userId),
    orderBy: desc(trips.updatedAt),
  });

  return NextResponse.json(list);
}
