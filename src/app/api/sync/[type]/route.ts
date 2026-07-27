import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl, serverFetch } from "@/lib/serverFetch";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const SYNC_ENDPOINTS: Record<string, string> = {
  measurements: "/measurements/sync",
  interventions: "/interventions/sync",
  "social-problems": "/social-problems/sync",
  "word-games": "/word-games/sync",
  "safety-plans": "/safety-plans/sync",
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;
  const endpoint = SYNC_ENDPOINTS[type];

  if (!endpoint) {
    return NextResponse.json({ message: "Invalid sync type." }, { status: 400 });
  }

  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
  }

  try {
    const body = await req.json();

    const response = await serverFetch(`${getBackendUrl()}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      timeoutMs: 30_000,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: `Sync failed: ${message}` },
      { status: 500 }
    );
  }
}
