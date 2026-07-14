import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
  }

  const pulseApiUrl = process.env.PULSE_API_URL;
  if (!pulseApiUrl) {
    return NextResponse.json(
      { message: "Pulse API URL is not configured." },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();

    const response = await fetch(`${pulseApiUrl}/devices`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        {
          message:
            (data as { message?: string }).message ||
            "Device registration failed.",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: `Something went wrong: ${message}` },
      { status: 500 }
    );
  }
}
