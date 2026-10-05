import { ForecastQuerySchema } from "@/utils/forecastUrl";
import ForecastPage from "@/app/components/forecast/ForecastPage";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolved = await searchParams;
  const result = ForecastQuerySchema.safeParse(resolved);

  return <ForecastPage initialQuery={result.success ? result.data : undefined} />;
}