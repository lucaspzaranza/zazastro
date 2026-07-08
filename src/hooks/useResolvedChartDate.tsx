import { BirthDate, ChatDateProps } from "@/interfaces/BirthChartInterfaces";
import moment from "moment-timezone";
import { useEffect, useState } from "react";
import { getHourAndMinute, getHouseSystemLabel } from "@/app/utils/chartUtils";
import { useBirthChart } from "@/contexts/BirthChartContext";
import { useTranslations } from "next-intl";

/**
 * Representa um bloco de metadados resolvido, pronto para ser exibido no
 * cabeçalho compacto. Dois "formatos" possíveis:
 * - Profecção: só ano + sistema de casas (sem dia/hora/local).
 * - Padrão (natal, retorno, lunar derivado, trânsitos): dia/mês/ano, hora
 *   formatada, nome do local e sistema de casas.
 *
 * formattedText já vem pronto como string de uma linha, para truncamento
 * direto no cabeçalho (ex: "31/08/1993 · 06:45 · Fortaleza · Placidus").
 */
export type ResolvedChartDate =
  | {
      kind: "profection";
      label?: string;
      year: number;
      houseSystemLabel: string;
      formattedText: string;
    }
  | {
      kind: "standard";
      label?: string;
      day: number;
      month: number;
      year: number;
      time: string;
      locationName: string;
      houseSystemLabel: string;
      formattedText: string;
    };

function formatTime(time: string): string {
  let [hours, minutes] = time.split(":");
  hours = hours.padStart(2, "0");
  minutes = minutes.padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Versão "sem JSX" de ChartDate: resolve a mesma lógica assíncrona
 * (profecção / retorno-lunar-derivado / padrão) e retorna dados estruturados
 * em vez de markup já formatado. ChartDate continua existindo e pode
 * inclusive usar este hook internamente, para não duplicar a lógica.
 */
export function useResolvedChartDate(props: ChatDateProps): ResolvedChartDate | undefined {
  const { chartType, birthChart, label, chartDate } = props;
  const [date, setDate] = useState<BirthDate | undefined>();
  const { houseSystem } = useBirthChart();
  const t = useTranslations();

  useEffect(() => {
    if (chartDate === undefined) return;

    if (chartType !== "return" && chartType !== "lunarDerived") {
      const convertedTime = getHourAndMinute(Number.parseFloat(chartDate.time));

      const transformedDate: BirthDate = {
        ...chartDate,
        time: convertedTime,
      };

      setDate(transformedDate);
    } else if ((chartType === "return" || chartType === "lunarDerived") && birthChart && birthChart.timezone) {
      const returnTime = birthChart.returnTime;
      const returnDate = moment.tz(returnTime, birthChart.timezone);
      setDate({
        day: returnDate.date(),
        month: returnDate.month() + 1,
        year: returnDate.year(),
        time: returnDate.format("HH:mm"),
        coordinates: {
          ...birthChart.birthDate.coordinates,
        },
      });
    }
  }, [birthChart, birthChart?.transits, chartDate]);

  if (date === undefined) return undefined;

  const houseSystemLabel = getHouseSystemLabel(houseSystem ?? "placidus");

  if (chartType === "profection") {
    const formattedText = `${t("profections.yearProfection")} ${date.year} (${houseSystemLabel})`;
    return {
      kind: "profection",
      label,
      year: date.year,
      houseSystemLabel,
      formattedText,
    };
  }

  const day = date.day;
  const month = date.month;
  const year = date.year;
  const time = formatTime(date.time ?? "00:00");
  const locationName = date.coordinates.name ?? "";

  const formattedText = `${day.toString().padStart(2, "0")}/${month
    .toString()
    .padStart(2, "0")}/${year} - ${time} - ${locationName} (${houseSystemLabel})`;

  return {
    kind: "standard",
    label,
    day,
    month,
    year,
    time,
    locationName,
    houseSystemLabel,
    formattedText,
  };
}