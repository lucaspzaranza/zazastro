// src/app/(charts)/profections/page.tsx
import { ProfectionQuerySchema } from "@/app/utils/chartUrl";
import ChartRuntime from "@/app/components/ChartRuntime";
import ProfectionMenu from "@/app/components/menus/ProfectionMenu";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolved = await searchParams;
  const result = ProfectionQuerySchema.safeParse({ type: "profection", ...resolved });

  if (!result.success) return <ProfectionMenu />;

  return <ChartRuntime query={result.data} />;
}