import { NextResponse } from "next/server";
import { deleteCategory } from "@/lib/categories";

export async function POST(request: Request) {
  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "Missing category id" }, { status: 400 });
  const result = await deleteCategory(id);
  if (result.error) return NextResponse.json(result, { status: 400 });
  return NextResponse.json(result);
}
