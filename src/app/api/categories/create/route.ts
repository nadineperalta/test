import { NextResponse } from "next/server";
import { createCategory } from "@/lib/categories";

export async function POST(request: Request) {
  const { name } = await request.json();
  const result = await createCategory(name);
  if (result.error) return NextResponse.json(result, { status: 400 });
  return NextResponse.json(result);
}
