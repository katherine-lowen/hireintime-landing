import { NextResponse } from "next/server";
export const runtime = "nodejs";
export async function GET() {
  return NextResponse.json({
    hasKey: !!process.env.OPENAI_API_KEY,
    keyPrefix: process.env.OPENAI_API_KEY?.slice(0, 7) ?? null,
    node: process.version,
    cwd: process.cwd(),
  });
}
