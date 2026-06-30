import {
  convertDegMinToDecimal,
  getHourAndMinute,
  monthsNames,
} from "@/app/utils/chartUtils";
import {
  BirthChartProfile,
  BirthDate,
  SelectedCity,
  TransitsChartFormData,
} from "@/interfaces/BirthChartInterfaces";
import React, { useEffect, useRef, useState } from "react";
import PresavedChartsDropdown from "./PresavedChartsDropdown";
import CitySearch from "../CitySearch";
import { useProfiles } from "@/contexts/ProfilesContext";
import { useBirthChart } from "@/contexts/BirthChartContext";
import Image from "next/image";
import HouseSystemDropdown from "../HouseSystemDropdown";
import { useTranslations } from "next-intl";

interface TransitsChartFormProps {
  currentBirthDate?: BirthDate;
  onSubmit?: (transitsFormData: TransitsChartFormData) => void;
}

export default function TransitsChartForm(props: TransitsChartFormProps) {
  const { onSubmit } = props;
  const t = useTranslations();

  const { profiles, createProfile, updateProfile, deleteProfile } =
    useProfiles();
  const [day, setDay] = useState<number | null>(null);
  const [month, setMonth] = useState(1);
  const [year, setYear] = useState<number | null>(null);
  const [hour, setHour] = useState<number | null>(null);
  const [minutes, setMinutes] = useState<number | null>(null);
  const [profile, setProfile] = useState<BirthChartProfile | undefined>();
  const [transitsDate, setTransitsDate] = useState<BirthDate | undefined>();
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (
      profile &&
      day &&
      month &&
      year &&
      hour !== null &&
      minutes !== null
    ) {
      setTransitsDate({
        day, 
        month, 
        year, 
        time: convertDegMinToDecimal(hour, minutes).toString(),
        coordinates: profile.birthDate!.coordinates
      });
    }
  }, [day, month, year, hour, minutes, profile]);

  useEffect(() => {
    if (profiles.length > 0) {
      setProfile(profiles[0]);
    }
  }, [profiles]);

  function submitForm() {
    if (!profile) {
      alert("Não foi possível gerar o mapa.");
      return;
    }

    if (form.current && form.current.checkValidity() && transitsDate) {
      onSubmit?.({profile, transitsDate});
    } else {
      form.current?.reportValidity();
    }
  }

  return (
    <form
      ref={form}
      className="w-full flex flex-col justify-between gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        submitForm();
      }}
    >

      <PresavedChartsDropdown
        onChange={(profile) => setProfile(profile)}
      />

       <div className="w-full flex flex-row justify-between gap-1">
        <input
          required
          className="default-input-field w-1/3 px-1"
          placeholder={t("form.day")}
          type="number"
          value={day ?? ""}
          onChange={(e) => {
            const parsed = Number.parseInt(e.target.value);
            if (Number.isNaN(parsed)) {
              setDay(null);
              return;
            }

            let val = parsed;
            if (val < 0) val = 1;
            if (val > 31) val = 31;
            setDay(val);
          }}
        />
        <select
          required
          className="default-input-field w-1/2"
          value={month}
          onChange={(e) => setMonth(Number.parseInt(e.target.value))}
        >
          {monthsNames.map((month, index) => (
            <option key={index} value={index + 1}>
              {t(`months.${index + 1}`)}
            </option>
          ))}
        </select>
        <input
          required
          type="number"
          className="default-input-field w-20 p-1"
          value={year ?? ""}
          placeholder={t("form.year")}
          onChange={(e) => {
            const parsed = Number.parseInt(e.target.value);
            if (Number.isNaN(parsed)) {
              setYear(null);
              return;
            }

            let val = parsed;
            if (val < 0) val = 0;
            if (val > 2999) val = 2999;
            setYear(val);
          }}
        />
      </div>

      <div className="w-full flex flex-row items-center gap-1">
        <input
          required
          type="number"
          className="default-input-field w-16 p-1"
          placeholder="16"
          value={hour ?? ""}
          onChange={(e) => {
            const parsed = Number.parseInt(e.target.value);
            if (Number.isNaN(parsed)) {
              setHour(null);
              return;
            }

            let val = parsed;
            if (val < 0) val = 0;
            if (val > 23) val = 23;
            setHour(val);
          }}
        />
        :
        <input
          required
          type="number"
          className="default-input-field w-16 p-1"
          placeholder="30"
          value={minutes ?? ""}
          onChange={(e) => {
            const parsed = Number.parseInt(e.target.value);
            if (Number.isNaN(parsed)) {
              setMinutes(null);
              return;
            }

            let val = parsed;
            if (val < 0) val = 0;
            if (val > 59) val = 59;
            setMinutes(val);
          }}
        />
      </div>

      <HouseSystemDropdown />

      <button
        type="submit"
        className="default-btn"
      >
        {t("birthChart.createMomentChart")}
        <Image src="/planets/transits/mercury.png" width={22} height={22} unoptimized alt="chart"/>
      </button>
      
    </form>
  );
}
