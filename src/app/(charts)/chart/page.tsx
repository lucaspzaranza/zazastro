// src/app/chart/page.tsx
import { BirthChartQuerySchema } from "@/utils/chartUrl";
import BirthChartMenu from "../../components/menus/BirthChartMenu";
import ChartRuntime from "../../components/ChartRuntime";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolved = await searchParams;
  const result = BirthChartQuerySchema.safeParse({ type: "birth", ...resolved });

  if (!result.success) return <BirthChartMenu />;

  return <ChartRuntime query={result.data} />;
}