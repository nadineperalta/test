import { NextResponse } from "next/server";
import { createHabit } from "@/lib/habits";

export async function POST(request: Request) {
  const body = await request.json();
  const result = await createHabit(body);
  if (result.error) return NextResponse.json(result, { status: 400 });
  return NextResponse.json(result);
}
