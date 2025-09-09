import {
  convertDegMinToDecimal,
  getHourAndMinute,
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
import { useChartMenu } from "@/contexts/ChartMenuContext";

interface BirthChartFormProps {
  currentBirthDate?: BirthDate;
  onSubmit?: (birthDate: BirthChartProfile | undefined) => void;
}

export default function BirthChartForm(props: BirthChartFormProps) {
  const { onSubmit } = props;

  const { profiles, createProfile, updateProfile, deleteProfile } =
    useProfiles();
  const [name, setName] = useState("");
  const [day, setDay] = useState(0);
  const [month, setMonth] = useState(1);
  const [year, setYear] = useState(0);
  const [hour, setHour] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [coordinates, setCoordinates] = useState<SelectedCity>({
    latitude: 0,
    longitude: 0,
  });
  const { chartMenu } = useChartMenu();
  const [profile, setProfile] = useState<BirthChartProfile | undefined>();
  const [menu, setMenu] = useState(0);
  const form = useRef<HTMLFormElement>(null);
  const [editProfile, setEditProfile] = useState(false);
  const [showDeleteProfileMenu, setShowDeleteProfileMenu] = useState(false);

  const selectCity = (selectedCity: SelectedCity) => {
    const cityName = selectedCity.name?.split(",")[0];

    setCoordinates({
      ...selectedCity,
      name: cityName,
    });
  };

  useEffect(() => {
    if (day > 0 && month > 0 && year > 0 && name.length > 0) {
      setProfile({
        id: editProfile ? profile?.id : undefined,
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
  }, [name, day, month, year, hour, minutes, coordinates]);

  useEffect(() => {
    if (profiles.length === 0) {
      setMenu(1);
    } else {
      // console.log("selecting first profile");
      setProfile(profiles[0]);
      if (profiles[0].birthDate)
        setCoordinates(profiles[0].birthDate.coordinates);
    }
  }, [profiles]);

  function updateProfileForEditing() {
    if (!profile) return;

    setName(profile.name!);

    if (profile.birthDate) {
      setDay(profile.birthDate.day);
      setMonth(profile.birthDate.month);
      setYear(profile.birthDate.year);

      const [hourToEdit, minutesToEdit] = getHourAndMinute(
        Number.parseFloat(profile.birthDate.time)
      ).split(":");

      setHour(Number.parseInt(hourToEdit));
      setMinutes(Number.parseInt(minutesToEdit));
      setCoordinates(profile.birthDate.coordinates);
    }
  }

  function submitForm() {
    if (!profile) {
      alert("Não foi possível gerar o mapa.");
      return;
    }

    if (menu === 0) {
      // Presaved options
      if (!editProfile) {
        onSubmit?.(profile);
      } else if (profile.id && updateProfile(profile.id, profile)) {
        onSubmit?.(profile);
      }
    } // create chart
    else if (form.current && form.current.checkValidity()) {
      if (createProfile(profile)) onSubmit?.(profile);
      else alert("Não foi possível gerar o mapa.");
    } else {
      form.current?.reportValidity();
    }
  }

  return (
    <form
      ref={form}
      className="w-full flex flex-col justify-between gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        submitForm();
      }}
    >
      {!editProfile && !showDeleteProfileMenu && (
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
            />
            Gerar novo mapa
          </label>
        </div>
      )}

      {menu === 0 && !editProfile && !showDeleteProfileMenu && (
        <PresavedChartsDropdown
          onChange={(newProfile) => {
            if (newProfile) {
              setProfile(newProfile);
            }
          }}
        />
      )}

      {((menu === 1 && !editProfile) || (menu === 0 && editProfile)) && (
        <>
          {editProfile && (
            <h1 className="w-full text-center font-bold">Editar Perfil</h1>
          )}
          <input
            required
            placeholder="Nome"
            className="border-2 p-1 rounded-sm"
            value={name}
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
              value={day}
              onChange={(e) => {
                const parsed = Number.parseInt(e.target.value);
                if (Number.isNaN(parsed)) {
                  setDay(0);
                  return;
                }

                let val = parsed;
                if (val < 1) val = 1;
                if (val > 31) val = 31;
                setDay(val);
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
              value={year}
              onChange={(e) => {
                const parsed = Number.parseInt(e.target.value);

                if (Number.isNaN(parsed)) {
                  setYear(0);
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
              className="border-2 w-16 p-1 rounded-sm"
              placeholder="16"
              value={hour}
              onChange={(e) => {
                const parsed = Number.parseInt(e.target.value);
                if (Number.isNaN(parsed)) {
                  setHour(0);
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
              className="border-2 w-16 p-1 rounded-sm"
              placeholder="30"
              value={minutes}
              onChange={(e) => {
                const parsed = Number.parseInt(e.target.value);
                if (Number.isNaN(parsed)) {
                  setMinutes(0);
                  return;
                }

                let val = parsed;
                if (val < 0) val = 0;
                if (val > 59) val = 59;
                setMinutes(val);
              }}
            />
          </div>
          <CitySearch
            initialCoordinates={
              menu === 0 ? profile?.birthDate?.coordinates : undefined
            }
            onSelect={selectCity}
          />
        </>
      )}

      {menu === 0 && !editProfile && !showDeleteProfileMenu && (
        <div className="w-full flex flex-row items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              updateProfileForEditing();
              setEditProfile(true);
            }}
            className="w-full bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 flex flex-row items-center justify-center gap-2"
          >
            Editar
            <img src="edit.png" width={16} />
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              console.log(profile);
              if (profile) {
                setShowDeleteProfileMenu(true);
              }
            }}
            className="w-full bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800 flex flex-row items-center justify-center gap-2"
          >
            Deletar
            <img src="trash-white.png" width={17} />
          </button>
        </div>
      )}

      {!showDeleteProfileMenu && !editProfile && (
        <button
          onClick={(e) => {
            e.preventDefault();
            // console.log("sending profile", profile);

            submitForm();
          }}
          className="bg-blue-800 w-full text-white px-4 py-2 rounded hover:bg-blue-900"
        >
          <span>Gerar Mapa Natal</span>
        </button>
      )}

      {menu === 0 && !showDeleteProfileMenu && editProfile && (
        <button
          onClick={(e) => {
            e.preventDefault();
            submitForm();
            setEditProfile(false);
          }}
          className="bg-green-700 w-full text-white px-4 py-2 rounded hover:bg-green-800"
        >
          Salvar edições e gerar Mapa Natal
        </button>
      )}

      {menu === 0 && showDeleteProfileMenu && profile && (
        <>
          <h1>
            Tem certeza que deseja deletar o perfil de{" "}
            <strong>{profile.name}</strong>?
          </h1>
          <div className="w-full flex flex-row items-center justify-between gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowDeleteProfileMenu(false);
              }}
              className="bg-green-700 w-full text-white px-4 py-2 rounded hover:bg-green-800"
            >
              Não
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                if (profile?.id && deleteProfile(profile.id)) {
                  setProfile(undefined);
                  setCoordinates({ latitude: 0, longitude: 0 });
                  alert("Perfil deletado com sucesso.");
                  if (profiles.length === 0) {
                    setMenu(1);
                  }
                  setShowDeleteProfileMenu(false);
                }
              }}
              className="bg-red-700 w-full text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Sim
            </button>
          </div>
        </>
      )}
    </form>
  );
}
