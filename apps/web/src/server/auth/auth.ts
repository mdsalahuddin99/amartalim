import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../db/prisma";
import bcrypt from "bcryptjs";

export type AppRole = "STUDENT" | "INSTRUCTOR" | "ADMIN";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma as any) as any,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        // Demo User Auto-Seeding & Backdoor
        const isDemoEmail = ["instructor@amartalim.com", "rahim@example.com", "amartalimbd@gmail.com", "admin@amartalim.com"].includes(credentials.email);
        
        if (!user) {
          if (isDemoEmail && credentials.password === "123456") {
             const passwordHash = await bcrypt.hash("123456", 10);
             const isInstructor = credentials.email.startsWith("instructor");
             const isAdmin = credentials.email === "admin@amartalim.com" || credentials.email === "amartalimbd@gmail.com";
             const name = isAdmin ? "Admin" : isInstructor ? "Instructor" : "Student";
             const newUser = await prisma.user.create({
                data: {
                  email: credentials.email,
                  name: name,
                  password: passwordHash,
                  role: (isAdmin ? "ADMIN" : "STUDENT") as any,
                  ...(isInstructor ? {
                    roleApplications: {
                      create: {
                        role: "INSTRUCTOR",
                        status: "APPROVED",
                        name: name,
                        bio: "Demo bio",
                      }
                    }
                  } : {})
                }
             });
             return { id: newUser.id, email: newUser.email, name: newUser.name, image: newUser.image, role: newUser.role };
          }
          throw new Error("User not found or using OAuth");
        }

        if (!user.password) {
          throw new Error("User not found or using OAuth");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          if (isDemoEmail && credentials.password === "123456") {
             return { id: user.id, email: user.email, name: user.name, image: user.image, role: user.role };
          }
          throw new Error("Incorrect password");
        }

        if (user.role === "ADMIN") {
          throw new Error("Admins must login via the admin dashboard.");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role, // role from prisma
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      if (!token.approvedRoles && token.id) {
        const apps = await prisma.roleApplication.findMany({
          where: { userId: token.id as string, status: "APPROVED" },
          select: { role: true }
        });
        token.approvedRoles = apps.map(a => a.role);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).approvedRoles = token.approvedRoles as string[] || [];
      }
      return session;
    },
  },
};

export const auth = async () => {
  const session = await getServerSession(authOptions);
  return session;
};
