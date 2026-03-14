import { NextResponse } from "next/server";
import { archiveHabit, unarchiveHabit } from "@/lib/habits";

export async function POST(request: Request) {
  const { id, undo } = await request.json();
  if (!id) return NextResponse.json({ error: "Missing habit id" }, { status: 400 });
  const result = undo ? await unarchiveHabit(id) : await archiveHabit(id);
  if (result.error) return NextResponse.json(result, { status: 400 });
  return NextResponse.json(result);
}
