import {
  convertDegMinToDecimal,
  monthsNames,
  presavedBirthDates,
} from "@/app/utils/chartUtils";
import {
  BirthChartProfile,
  BirthDate,
  Coordinates,
  SelectedCity,
} from "@/interfaces/BirthChartInterfaces";
import React, { useEffect, useRef, useState } from "react";
import PresavedChartsDropdown from "./PresavedChartsDropdown";
import CitySearch from "../CitySearch";
import { useProfiles } from "@/contexts/ProfilesContext";

interface BirthChartFormProps {
  currentBirthDate?: BirthDate;
  onSubmit?: (birthDate: BirthChartProfile | undefined) => void;
}

export default function BirthChartForm(props: BirthChartFormProps) {
  const { onSubmit } = props;

  const { profiles, createProfile } = useProfiles();
  const [name, setName] = useState("");
  const [day, setDay] = useState(1);
  const [month, setMonth] = useState(1);
  const [year, setYear] = useState(0);
  const [hour, setHour] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [coordinates, setCoordinates] = useState<SelectedCity>({
    latitude: 0,
    longitude: 0,
  });
  const [profile, setProfile] = useState<BirthChartProfile | undefined>(
    presavedBirthDates.lucasz
  );
  const [menu, setMenu] = useState(0);
  const form = useRef<HTMLFormElement>(null);
  const [editProfile, setEditProfile] = useState(false);

  const selectCity = (selectedCity: SelectedCity) => {
    // console.log("Cidade Selecionada:");
    // console.log(selectedCity);

    const cityName = selectedCity.name?.split(",")[0];

    setCoordinates({
      ...selectedCity,
      name: cityName,
    });
  };

  useEffect(() => {
    if (day > 0 && hour > 0 && minutes > 0 && month > 0 && year > 0) {
      setProfile({
        name,
        birthDate: {
          day,
          month,
          year,
          time: convertDegMinToDecimal(hour, minutes).toString(),
          coordinates,
        },
      });
    }
  }, [day, month, year, hour, minutes, coordinates]);

  useEffect(() => {
    if (profiles.length === 0) {
      setMenu(1);
    }
  }, [profiles]);

  return (
    <form
      ref={form}
      className="w-full flex flex-col justify-between gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (menu === 0) {
          onSubmit?.(profile);
        } else if (profile && form.current && form.current.checkValidity()) {
          if (createProfile(profile)) onSubmit?.(profile);
        } else {
          form.current?.reportValidity();
        }
      }}
    >
      <div className="w-full flex flex-row gap-2">
        <label htmlFor="load" className="w-1/2 gap-2 flex flex-row">
          <input
            type="radio"
            id="load"
            name="group"
            value={0}
            defaultChecked={profiles.length > 0}
            disabled={profiles.length === 0}
            onChange={(e) => setMenu(0)}
          />
          Carregar mapa
        </label>

        <label
          htmlFor="create"
          className="w-1/2 gap-2 flex flex-row items-center justify-end"
        >
          <input
            type="radio"
            id="create"
            name="group"
            value={1}
            defaultChecked={profiles.length === 0}
            onChange={(e) => setMenu(1)}
          />{" "}
          Gerar novo mapa
        </label>
      </div>

      {menu === 0 && !editProfile && (
        <PresavedChartsDropdown
          onChange={(newBirthDate) => setProfile(newBirthDate)}
        />
      )}

      {((menu === 1 && !editProfile) || (menu === 0 && editProfile)) && (
        <>
          <input
            required
            placeholder="Nome"
            className="border-2 p-1 rounded-sm"
            onChange={(e) => {
              setName(e.target.value);
            }}
          />
          <div className="w-full flex flex-row justify-between gap-1">
            <input
              required
              className="border-2 rounded-sm w-1/3 px-1"
              placeholder="Dia"
              type="number"
              onChange={(e) => {
                if (e.target.value.length > 0) {
                  let val = Number.parseInt(e.target.value);
                  if (val < 1) val = 1;
                  if (val > 31) val = 31;
                  setDay(val);
                  e.target.value = val.toString();
                }
              }}
            />
            <select
              required
              className="border-2 w-1/2 rounded-sm"
              value={month}
              onChange={(e) => setMonth(Number.parseInt(e.target.value))}
            >
              {monthsNames.map((month, index) => (
                <option key={index} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
            <input
              required
              type="number"
              className="border-2 w-20 p-1 rounded-sm"
              placeholder="Ano"
              onChange={(e) => {
                if (e.target.value.length > 0) {
                  let val = Number.parseInt(e.target.value);
                  if (val < 0) val = 0;
                  if (val > 2999) val = 2999;
                  setYear(val);
                  e.target.value = val.toString();
                }
              }}
            />
          </div>
          <div className="w-full flex flex-row items-center gap-1">
            <input
              required
              type="number"
              className="border-2 w-16 p-1 rounded-sm"
              placeholder="16"
              onChange={(e) => {
                if (e.target.value.length > 0) {
                  let val = Number.parseInt(e.target.value);
                  if (val < 0) val = 0;
                  if (val > 23) val = 23;
                  setHour(val);
                  e.target.value = val.toString();
                }
              }}
            />
            :
            <input
              required
              type="number"
              className="border-2 w-16 p-1 rounded-sm"
              placeholder="30"
              onChange={(e) => {
                if (e.target.value.length > 0) {
                  let val = Number.parseInt(e.target.value);
                  if (val < 0) val = 0;
                  if (val > 59) val = 59;
                  setMinutes(val);
                  e.target.value = val.toString();
                }
              }}
            />
          </div>
          <CitySearch onSelect={selectCity} />
        </>
      )}

      {menu === 0 && !editProfile && (
        <div className="flex flex-row gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
            }}
            className="bg-green-700 w-1/2 text-white px-4 py-2 rounded hover:bg-green-800 flex flex-row items-center justify-center gap-2"
          >
            Editar
            <img src="edit.png" width={16} />
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
            }}
            className="bg-red-700 w-1/2 text-white px-4 py-2 rounded hover:bg-red-800 flex flex-row items-center justify-center gap-2"
          >
            Deletar
            <img src="trash-white.png" width={17} />
          </button>
        </div>
      )}

      <button
        onClick={(e) => {
          e.preventDefault();
          if (menu === 0) {
            onSubmit?.(profile);
          } else if (profile && form.current && form.current.checkValidity()) {
            if (createProfile(profile)) onSubmit?.(profile);
            else alert("Não foi possível gerar o mapa.");
          } else {
            form.current?.reportValidity();
          }
        }}
        className="bg-blue-800 w-full text-white px-4 py-2 rounded hover:bg-blue-900"
      >
        Gerar Mapa Natal
      </button>
    </form>
  );
}
