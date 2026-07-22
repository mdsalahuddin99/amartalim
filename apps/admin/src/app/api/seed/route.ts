import { NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const passwordHash = await bcrypt.hash("changeme", 10);
    const admin = await prisma.user.upsert({
      where: { email: "admin@amartalim.com" },
      update: {
        role: "ADMIN",
        password: passwordHash,
      },
      create: {
        email: "admin@amartalim.com",
        name: "Admin",
        password: passwordHash,
        role: "ADMIN",
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Admin user seeded successfully!", 
      email: admin.email,
      password: "changeme"
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
