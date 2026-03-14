import { NextResponse } from "next/server";
import { completeHabit } from "@/lib/habits";

export async function POST(request: Request) {
  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "Missing habit id" }, { status: 400 });
  const result = await completeHabit(id);
  if (result.error) return NextResponse.json(result, { status: 400 });
  return NextResponse.json(result);
}
