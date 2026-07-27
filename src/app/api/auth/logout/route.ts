import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl, serverFetch } from "@/lib/serverFetch";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (token) {
      try {
        await serverFetch(`${getBackendUrl()}/auth/logout`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          timeoutMs: 5_000,
        });
      } catch {
        // Still clear the cookie even if upstream logout fails/times out.
      }
    }

    const res = NextResponse.json({ message: "Logged out successfully." });
    res.cookies.delete("token");
    return res;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: `Something went wrong: ${message}` },
      { status: 500 }
    );
  }
}
