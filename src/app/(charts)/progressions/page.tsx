// src/app/(charts)/progressions/page.tsx
import { ProgressionQuerySchema } from "@/app/utils/chartUrl";
import ChartRuntime from "@/app/components/ChartRuntime";
import ProgressionMenu from "@/app/components/menus/ProgressionMenu";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolved = await searchParams;
  const result = ProgressionQuerySchema.safeParse({ type: "progression", ...resolved });

  if (!result.success) return <ProgressionMenu />;

  return <ChartRuntime query={result.data} />;
}