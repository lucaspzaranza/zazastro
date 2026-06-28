import { ChatDateProps } from "@/interfaces/BirthChartInterfaces";
import { useResolvedChartDate } from "@/hooks/useResolvedChartDate";

export const ChartDate = (props: ChatDateProps) => {
  const resolved = useResolvedChartDate(props);

  if (resolved === undefined) return;

  if (resolved.kind === "profection")
    return (
      <div className="text-[0.9rem] text-center md:text-[1rem] font-bold">
        <p>{resolved.formattedText}</p>
      </div>
    );

  return (
    <div className="text-[0.9rem] text-center md:text-[1rem] font-bold">
      <p>
        {resolved.label && <label>{resolved.label}: </label>}
        {resolved.day.toString().padStart(2, "0")}/
        {resolved.month.toString().padStart(2, "0")}/{resolved.year} -{" "}
        {resolved.time}
        &nbsp;-&nbsp;
        {resolved.locationName} ({resolved.houseSystemLabel})
      </p>
    </div>
  );
};