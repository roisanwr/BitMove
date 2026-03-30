"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function loginAction(prevState: any, formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials." };
        default:
          return { error: "Something went wrong." };
      }
    }
    throw error;
  }
}

export async function registerAction(prevState: any, formData: FormData) {
  const username = formData.get("username") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;

  if (!username || !email || !password) {
    return { error: "Missing required fields." };
  }

  // Check existing user
  const existingUser = await prisma.profiles.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });

  if (existingUser) {
    return { error: "Username or email already exists." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await prisma.profiles.create({
      data: {
        username,
        email,
        password_hash: hashedPassword,
        full_name: fullName,
      },
    });
  } catch (error) {
    return { error: "Failed to create account." };
  }

  redirect("/login");
}
