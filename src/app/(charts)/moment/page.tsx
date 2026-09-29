// src/app/moment/page.tsx
import { MomentChartQuerySchema } from "@/utils/chartUrl";
import MomentMenu from "../../components/menus/MomentMenu";
import ChartRuntime from "../../components/ChartRuntime";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolved = await searchParams;
  const result = MomentChartQuerySchema.safeParse({ type: "moment", ...resolved });

  if (!result.success) return <MomentMenu />;

  return <ChartRuntime query={result.data} />;
}