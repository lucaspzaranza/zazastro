import { useBirthChart } from "@/contexts/BirthChartContext";
import { BirthDate, ChartType } from "@/interfaces/BirthChartInterfaces";
import moment from "moment-timezone";
import { useEffect, useState } from "react";

export const ChartDate = (
  props: Readonly<{
    chartType: ChartType;
  }>
) => {
  const { chartType } = props;
  const [date, setDate] = useState<BirthDate | undefined>();
  const { birthChart } = useBirthChart();

  useEffect(() => {
    if (birthChart === undefined) return;

    if (chartType === "birth") {
      setDate(birthChart.birthDate);
    } else if (birthChart.timezone) {
      const returnDate = moment.tz(birthChart.returnTime, birthChart.timezone);
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
  }, [birthChart]);

  if (date === undefined) return;

  return (
    <div>
      <h2 className="font-bold text-lg mb-2">Dados do mapa:</h2>
      <p>
        {date?.day.toString().padStart(2, "0")}/
        {date?.month.toString().padStart(2, "0")}/{date?.year} - {date?.time} (
        {date?.coordinates.latitude},{date?.coordinates.longitude})
      </p>
    </div>
  );
};
