// next-auth.d.ts
import NextAuth, { DefaultSession, User as NextAuthUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string; // Add role here
    } & DefaultSession["user"];
  }

  interface User extends NextAuthUser {
    role: string; // Add role here
  }
}
