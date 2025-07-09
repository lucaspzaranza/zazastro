import { useBirthChart } from "@/contexts/BirthChartContext";
import { BirthDate } from "@/interfaces/BirthChartInterfaces";
import { useEffect, useRef, useState } from "react";

export const ChartDate = () => {
  // const [date, setDate] = useState<BirthDate | undefined>();
  const date = useRef<BirthDate | undefined>(undefined);
  const { birthChart } = useBirthChart();

  useEffect(() => {
    date.current = birthChart?.targetDate
      ? birthChart.targetDate
      : birthChart?.birthDate;

    console.log(date.current);
  }, [birthChart]);

  // if (date.current === undefined) return;

  return (
    <div>
      <h2 className="font-bold text-lg mb-2">Dados do mapa:</h2>
      <p>
        {date.current?.day}/{date.current?.month.toString().padStart(2, "0")}/
        {date.current?.year} - {date.current?.time}, (
        {date.current?.coordinates.latitude},
        {date.current?.coordinates.longitude})
      </p>
    </div>
  );
};
