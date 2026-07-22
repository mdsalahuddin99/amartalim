import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import bcrypt from "bcryptjs";

/**
 * POST /api/auth/verify-credentials
 * Verifies email + password against the database and returns the user object.
 * Does NOT create a NextAuth session — used for the User Panel dual-session system.
 */
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "ইমেইল ও পাসওয়ার্ড প্রয়োজন।" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: "ভুল ইমেইল বা পাসওয়ার্ড।" }, { status: 401 });
    }

    if (!user.password) {
      return NextResponse.json({ error: "এই অ্যাকাউন্টে পাসওয়ার্ড নেই। Google দিয়ে লগইন করুন।" }, { status: 401 });
    }

    // Demo backdoor — same as auth.ts
    const isDemoEmail = ["admin@amartalim.com", "instructor@amartalim.com", "rahim@example.com"].includes(email);
    let isValid = await bcrypt.compare(password, user.password);
    if (!isValid && isDemoEmail && password === "123456") {
      isValid = true;
    }

    if (!isValid) {
      return NextResponse.json({ error: "ভুল ইমেইল বা পাসওয়ার্ড।" }, { status: 401 });
    }

    // Return safe user object (no password)
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("[verify-credentials]", err);
    return NextResponse.json({ error: "সার্ভার ত্রুটি।" }, { status: 500 });
  }
}
