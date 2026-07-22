/**
 * Prisma seed — runs `pnpm prisma db seed` after Next.js migration.
 * Creates initial admin user + a few categories.
 */
// import { PrismaClient } from "@prisma/client";
// import bcrypt from "bcryptjs";
//
// const prisma = new PrismaClient();
//
// async function main() {
//   const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD ?? "changeme", 10);
//   await prisma.user.upsert({
//     where: { email: "admin@amartalim.com" },
//     update: {},
//     create: {
//       email: "admin@amartalim.com",
//       name: "Admin",
//       password: passwordHash,
//       role: "ADMIN",
//     },
//   });
// }
//
// main().finally(() => prisma.$disconnect());

export {};
