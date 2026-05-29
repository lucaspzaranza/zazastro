"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function setLocale(locale: string) {
  const cookieStore = await cookies();
  cookieStore.set("locale", locale, { path: "/" });
  revalidatePath("/");
}