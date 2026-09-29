// src/app/solar-return/page.tsx

import ChartRuntime from "@/app/components/ChartRuntime";
import SolarReturnMenu from "@/app/components/menus/SolarReturnMenu";
import { SolarReturnQuerySchema } from "@/app/utils/chartUrl";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolved = await searchParams;
  const result = SolarReturnQuerySchema.safeParse({ type: "solarReturn", ...resolved });

  if (!result.success) return <SolarReturnMenu />;

  return <ChartRuntime query={result.data} />;
}