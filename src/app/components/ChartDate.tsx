import { BirthDate, ChatDateProps } from "@/interfaces/BirthChartInterfaces";
import moment from "moment-timezone";
import { useEffect, useState } from "react";
import { getHourAndMinute } from "../utils/chartUtils";

export const ChartDate = (props: ChatDateProps) => {
  const { chartType, birthChart, label } = props;
  const [date, setDate] = useState<BirthDate | undefined>();

  useEffect(() => {
    if (birthChart === undefined) return;

    if (chartType === "birth") {
      const convertedTime = getHourAndMinute(
        Number.parseFloat(birthChart.birthDate.time)
      );

      const transformedDate: BirthDate = {
        ...birthChart.birthDate,
        time: convertedTime,
      };

      setDate(transformedDate);
    } else if (birthChart.timezone) {
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
  }, [birthChart]);

  const formatTime = (time: string): string => {
    let [hours, minutes] = time.split(":");
    hours = hours.padStart(2, "0");
    minutes = minutes.padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  if (date === undefined) return;

  return (
    <div className="text-[0.9rem] text-center md:text-[1rem] font-bold">
      <p>
        {label && <label>{label}: </label>}
        {date?.day.toString().padStart(2, "0")}/
        {date?.month.toString().padStart(2, "0")}/{date?.year} -{" "}
        {formatTime(date.time ?? "00:00")}
        &nbsp;-&nbsp;
        {date?.coordinates.name}
      </p>
    </div>
  );
};
