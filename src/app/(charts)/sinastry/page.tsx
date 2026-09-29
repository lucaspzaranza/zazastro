// src/app/(charts)/sinastry/page.tsx
import { SinastryQuerySchema } from "@/app/utils/chartUrl";
import ChartRuntime from "@/app/components/ChartRuntime";
import SinastryMenu from "@/app/components/menus/SinastryMenu";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolved = await searchParams;
  const result = SinastryQuerySchema.safeParse({ type: "sinastry", ...resolved });

  if (!result.success) return <SinastryMenu />;

  return <ChartRuntime query={result.data} />;
}