import { getAuth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = async (request: Request) => {
  try {
    const auth = getAuth();
    const handler = toNextJsHandler(auth);
    return handler.GET(request);
  } catch (error) {
    console.error("Auth GET error:", error);
    return NextResponse.json(
      { error: "Auth error", message: String(error) },
      { status: 500 }
    );
  }
};

export const POST = async (request: Request) => {
  try {
    const auth = getAuth();
    const handler = toNextJsHandler(auth);
    const response = await handler.POST(request);
    if (response.status >= 500) {
      const body = await response.clone().text();
      console.error("Auth POST 5xx:", response.status, body);
    }
    return response;
  } catch (error) {
    console.error("Auth POST error:", error);
    return NextResponse.json(
      { error: "Auth error", message: String(error) },
      { status: 500 }
    );
  }
};
