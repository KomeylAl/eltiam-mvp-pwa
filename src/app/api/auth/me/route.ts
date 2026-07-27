import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl, serverFetch } from "@/lib/serverFetch";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
  }

  try {
    const response = await serverFetch(`${getBackendUrl()}/auth/me`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: "Unauthenticated." },
        { status: response.status }
      );
    }

    const data = await response.json<{ data: unknown }>();
    return NextResponse.json(data.data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: `Something went wrong: ${message}` },
      { status: 500 }
    );
  }
}
