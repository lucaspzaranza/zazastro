// src/app/(charts)/lunar-return/page.tsx
import { LunarReturnQuerySchema } from "@/app/utils/chartUrl";
import ChartRuntime from "@/app/components/ChartRuntime";
import LunarReturnMenu from "@/app/components/menus/LunarReturnMenu";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolved = await searchParams;
  const result = LunarReturnQuerySchema.safeParse({ type: "lunarReturn", ...resolved });

  if (!result.success) return <LunarReturnMenu />;

  return <ChartRuntime query={result.data} />;
}