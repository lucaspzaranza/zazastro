// src/app/(charts)/transits/page.tsx
import { TransitsChartQuerySchema } from "@/app/utils/chartUrl";
import ChartRuntime from "@/app/components/ChartRuntime";
import TransitsMenu from "@/app/components/menus/TransitsMenu";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolved = await searchParams;
  const result = TransitsChartQuerySchema.safeParse({ type: "transits", ...resolved });

  if (!result.success) return <TransitsMenu />;

  return <ChartRuntime query={result.data} />;
}