// src/app/(charts)/chart/page.tsx
import { BirthChartQuerySchema } from "@/utils/chartUrl";
import ChartRuntime from "@/app/components/ChartRuntime";
import BirthChartMenu from "@/app/components/menus/BirthChartMenu";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolved = await searchParams;

  if (resolved.edit === "true" && typeof resolved.profileId === "string") {
    return <BirthChartMenu editProfileId={resolved.profileId} />;
  }

  const result = BirthChartQuerySchema.safeParse({ type: "birth", ...resolved });
  if (!result.success) return <BirthChartMenu />;

  return <ChartRuntime query={result.data} />;
}