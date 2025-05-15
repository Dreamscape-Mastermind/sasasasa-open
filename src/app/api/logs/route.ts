import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { level, message, context, data } = body;

    // TODO: Send to external log service (Sentry, DataDog, etc.)
    console.log(
      `[SERVER LOG] [${context}] ${level.toUpperCase()}: ${message}`,
      data
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Logging error:", error);
    return NextResponse.json({ error: "Failed to log event" }, { status: 500 });
  }
}
