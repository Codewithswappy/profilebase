"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signIn, signOut } from "@/lib/auth";
import { RegisterSchema, LoginSchema, RegisterInput, LoginInput } from "@/lib/validations";
import { AuthError } from "next-auth";

export type ActionResult<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string };

// ============================================
// REGISTER
// ============================================

export async function register(input: RegisterInput): Promise<ActionResult<{ userId: string }>> {
  try {
    const validated = RegisterSchema.safeParse(input);
    
    if (!validated.success) {
      return { success: false, error: (validated.error as any).errors[0].message };
    }

    const { name, email, password } = validated.data;

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: "An account with this email already exists" };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    return { success: true, data: { userId: user.id } };
  } catch (error) {
    console.error("Register error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

// ============================================
// LOGIN
// ============================================

export async function login(input: LoginInput): Promise<ActionResult> {
  try {
    const validated = LoginSchema.safeParse(input);
    
    if (!validated.success) {
      return { success: false, error: (validated.error as any).errors[0].message };
    }

    const { email, password } = validated.data;

    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "Invalid email or password" };
        default:
          return { success: false, error: "Something went wrong. Please try again." };
      }
    }
    throw error;
  }
}

// ============================================
// LOGOUT
// ============================================

export async function logout(): Promise<void> {
  await signOut({ redirect: false });
}

// ============================================
// SOCIAL LOGIN
// ============================================

export async function loginWithGoogle() {
  await signIn("google", { redirectTo: "/dashboard" });
}
