import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const authToken = req.cookies.get("token")?.value;

  if (!authToken) {
    return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
  }

  const pulseApiUrl = process.env.PULSE_API_URL;
  const pulseApiKey = process.env.PULSE_API_KEY;

  if (!pulseApiUrl || !pulseApiKey) {
    return NextResponse.json(
      { message: "Pulse API is not configured." },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();

    const response = await fetch(`${pulseApiUrl}/push/device-tokens`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Pulse-Api-Key": pulseApiKey,
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
