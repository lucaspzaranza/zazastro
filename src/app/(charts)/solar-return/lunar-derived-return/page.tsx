// src/app/solar-return/lunar-derived-return/page.tsx
// import { LunarDerivedReturnQuerySchema } from "@/lib/chart-url";
// import ChartRuntime from "@/app/components/ChartRuntime";
// import LunarDerivedMenu from "@/app/components/menus/LunarDerivedMenu";

import ChartRuntime from "@/app/components/ChartRuntime";
import { LunarDerivedReturnQuerySchema } from "@/app/utils/chartUrl";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolved = await searchParams;
  const result = LunarDerivedReturnQuerySchema.safeParse({
    type: "lunarDerivedReturn",
    ...resolved,
  });

  if (!result.success) return <LunarDerivedMenu />;

  return <ChartRuntime query={result.data} />;
}