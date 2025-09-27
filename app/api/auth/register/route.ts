import { NextRequest, NextResponse } from "next/server";
import { RegisterSchema } from "@/lib/validation/auth";
import { UserDAL } from "@/server/dal/user";

// Force Node.js runtime to support database operations
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request data
    const validatedData = RegisterSchema.parse(body);

    // Create user in database
    const user = await UserDAL.create({
      email: validatedData.email,
      password: validatedData.password,
      firstName: validatedData.firstName || undefined,
      lastName: validatedData.lastName || undefined,
      emailVerified: false,
      twoFactorEnabled: false,
    });

    // Return success response (don't include sensitive data)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error instanceof Error && error.message.includes("already exists")) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
