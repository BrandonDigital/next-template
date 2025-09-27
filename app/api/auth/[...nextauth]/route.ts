import NextAuth from "@/server/auth/auth";

// Force Node.js runtime to support database operations
export const runtime = "nodejs";

// NextAuth v4 style - the default export handles both GET and POST
const handler = NextAuth;

export { handler as GET, handler as POST };
