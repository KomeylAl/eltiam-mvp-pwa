import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("token");
  try {
    const res = NextResponse.json(
      { message: "Logged out successfuly" },
      { status: 200 }
    );

    res.cookies.delete("token");
    res.cookies.delete("role");

    return res;
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      { message: `Something went wrong ${error.message}` },
      { status: 500 }
    );
  }
}
