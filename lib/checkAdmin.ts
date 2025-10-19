"use server";

import { auth, currentUser } from "@clerk/nextjs/server";

export async function checkIsAdmin(): Promise<boolean> {
  const { userId } = await auth();
  
  if (!userId) return false;

  // Get user from Clerk
  const { clerkClient } = await import("@clerk/nextjs/server");
  const user = await currentUser()
  if(!user) return false
  const email = user.primaryEmailAddress?.emailAddress;

  if (!email) return false;

  const admins = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return admins.includes(email.toLowerCase());
}