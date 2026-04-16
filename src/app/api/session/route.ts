import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const email = cookieStore.get("userEmail")?.value;

    if (!email) {
      return NextResponse.json({ user: null });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!dbUser) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: String(dbUser.id),
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
      },
    });
  } catch (error) {
    console.error("Session GET error:", error);
    return NextResponse.json({ user: null });
  }
}

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();
    
    // JWT decoding (server-side)
    const base64Url = idToken.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(Buffer.from(base64, 'base64').toString());
    const email = payload.email;

    if (!email) {
      return NextResponse.json({ ok: false, error: "No email found in token" }, { status: 400 });
    }

    // Ensure user exists in DB and get their real role
    const dbUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!dbUser) {
      return NextResponse.json({ ok: false, error: "User record not found in database" }, { status: 404 });
    }

    const cookieStore = await cookies();
    cookieStore.set("userEmail", email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    return NextResponse.json({ 
      ok: true, 
      user: {
        id: String(dbUser.id),
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
      }
    });
  } catch (error) {
    console.error("Session POST error:", error);
    return NextResponse.json({ ok: false, error: "Failed to set session" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("userEmail");
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Failed to clear session" }, { status: 500 });
  }
}
