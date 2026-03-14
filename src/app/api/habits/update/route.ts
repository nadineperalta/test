import { NextResponse } from "next/server";
import { updateHabit } from "@/lib/habits";

export async function POST(request: Request) {
  const { id, ...data } = await request.json();
  if (!id) return NextResponse.json({ error: "Missing habit id" }, { status: 400 });
  const result = await updateHabit(id, data);
  if (result.error) return NextResponse.json(result, { status: 400 });
  return NextResponse.json(result);
}
