import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { compare } from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

const googleProvider = env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
  ? Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    })
  : null;

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    ...(googleProvider ? [googleProvider] : []),
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const email = String(credentials.email || "").toLowerCase();
        const password = String(credentials.password || "");

        if (!email || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user?.passwordHash) {
          return null;
        }

        const isValid = await compare(password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ].filter(Boolean),
  callbacks: {
    async signIn({ user, profile }) {
      if (profile?.email) {
        let existingUser = await prisma.user.findUnique({
          where: { email: profile.email },
        });
        if (!existingUser) {
          existingUser = await prisma.user.create({
            data: {
              email: profile.email,
              name: profile.name || profile.email.split("@")[0],
              role: "MEMBER",
            },
          });
        }
        return true;
      }
      return true;
    },
    async jwt({ token, user, account, profile }) {
      if (profile?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: profile.email },
        });
        if (dbUser) {
          token.id = String(dbUser.id);
          token.role = dbUser.role;
        }
      } else if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role || "MEMBER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id || token.sub);
        session.user.role = String(token.role || "MEMBER");
      }
      return session;
    },
  },
  pages: {
    signIn: "/membership",
  },
});