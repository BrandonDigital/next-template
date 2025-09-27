import NextAuth from "next-auth";
import type { NextAuthOptions, Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { config } from "@/config/config";
import { getAvailableProviders } from "@/config/providers";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

// Server-side import of UserDAL
let UserDAL: typeof import("@/server/dal/user").UserDAL | null | false = null;
async function getUserDAL() {
  if (UserDAL === null && typeof window === "undefined") {
    try {
      const { UserDAL: ImportedUserDAL } = await import("@/server/dal/user");
      UserDAL = ImportedUserDAL;
    } catch (error) {
      console.warn("Database not available:", error);
      UserDAL = false; // Mark as unavailable
    }
  }
  return UserDAL || null;
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token.sub) {
        session.user!.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  providers: [
    // Always include credentials provider
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsedCredentials = loginSchema.safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;

          try {
            // First check the admin credentials for backward compatibility
            if (
              email === config.admin.email &&
              password === config.admin.password
            ) {
              return {
                id: "admin",
                email: email,
                name: config.admin.name,
              };
            }

            // Use database authentication if available
            const userDAL = await getUserDAL();
            if (userDAL) {
              const user = await userDAL.verifyPassword(email, password);

              if (user) {
                return {
                  id: user.id,
                  email: user.email,
                  name:
                    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                    user.email,
                  image: user.profileImage,
                };
              }
            }
          } catch (error) {
            console.error("Auth error:", error);
            return null;
          }
        }

        return null;
      },
    }),
    // Dynamically add OAuth providers based on environment variables
    ...getAvailableProviders(),
  ],
};

// Export the auth configuration
export { authOptions };

// Create and export NextAuth instance
export default NextAuth(authOptions);
