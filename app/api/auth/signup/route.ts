import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import axios from "axios";

export async function POST(request: Request) {
  try {
    const { email, password, name, role, recaptchaToken, location, latitude, longitude } = await request.json();

    if (!email || !password || !name || !recaptchaToken || !location || !latitude || !longitude) {
      return NextResponse.json(
        { error: "Missing Required Fields" },
        { status: 400 }
      );
    }

    // Verify reCAPTCHA
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    if (!recaptchaSecret) {
      return NextResponse.json(
        { error: "Server Misconfiguration: Missing reCAPTCHA Secret Key" },
        { status: 500 }
      );
    }

    const recaptchaResponse = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          secret: recaptchaSecret,
          response: recaptchaToken,
        },
      }
    );

    if (!recaptchaResponse.data.success) {
      return NextResponse.json(
        { error: "reCAPTCHA verification failed" },
        { status: 400 }
      );
    }

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User Already Exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: role || "USER", // Default to USER role
        location,
        latitude,
        longitude,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error("SignUp Error: ", error);
    return NextResponse.json(
      { error: "Error Creating User" },
      { status: 500 }
    );
  }
}
