import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { phone, password } = await req.json();

    const response = await fetch(`${process.env.BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone, password }),
    });

    if (!response.ok) {
      const data = await response.json();
      console.log(data);
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(data);

    const cookies = [
      `token=${data.access_token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24};`,
      `refreshToken=${data.refresh_token}; HttpOnly; Path=/; Max-Age=${
        60 * 60 * 24 * 30
      };`,
    ].join(", ");

    const headers = new Headers();
    headers.append("Set-Cookie", cookies);

    return new NextResponse(JSON.stringify(data.user), {
      headers,
    });
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      { message: `Something went wrong ${error.message}` },
      { status: 500 }
    );
  }
}
