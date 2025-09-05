import { PlanetAspectData } from "@/interfaces/AstroChartInterfaces";
import { BirthChartProfile } from "@/interfaces/BirthChartInterfaces";

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { v4 as uuidv4 } from "uuid";

interface ProfilesContextType {
  profiles: BirthChartProfile[];
  createProfile: (profile: BirthChartProfile) => boolean;
  readProfile: (id: string) => BirthChartProfile | null;
  updateProfile: (id: string, profile: BirthChartProfile) => boolean;
  deleteProfile: (id: string) => boolean;
}

const PROFILE_KEY = "zazastro:profile-";

const ProfilesContext = createContext<ProfilesContextType | undefined>(
  undefined
);

export const ProfilesContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [profiles, setProfiles] = useState<BirthChartProfile[]>([]);

  useEffect(() => {
    const array: BirthChartProfile[] = [];
    // localStorage.clear();
    // console.log(localStorage);

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key === null || !key.startsWith(PROFILE_KEY)) continue;

      const rawProfile = localStorage.getItem(key);
      if (rawProfile !== null) {
        console.log(rawProfile);

        const parsed = JSON.parse(rawProfile);
        array.push(parsed);
      }
    }

    if (array.length > 0) {
      setProfiles([...array]);
    }
  }, []);

  const createProfile = (profile: BirthChartProfile): boolean => {
    try {
      const id = uuidv4();
      const profileID = PROFILE_KEY + id;
      const profileWithId: BirthChartProfile = {
        ...profile,
        id: profileID,
      };

      localStorage.setItem(profileID, JSON.stringify(profileWithId));

      setProfiles((prev) => [...prev, profileWithId]);
      return true;
    } catch {
      return false;
    }
  };

  const readProfile = (id: string): BirthChartProfile | null => {
    const rawProfile = localStorage.getItem(id);

    if (rawProfile !== null) {
      const parsed = JSON.parse(rawProfile) as BirthChartProfile;
      return parsed;
    }

    return null;
  };

  const updateProfile = (id: string, profile: BirthChartProfile): boolean => {
    try {
      localStorage.setItem(id, JSON.stringify(profile));
      setProfiles(
        profiles.map((p) => {
          if (p.id !== id) return p;
          else return profile;
        })
      );
      return true;
    } catch {
      return false;
    }
  };

  const deleteProfile = (id: string): boolean => {
    try {
      localStorage.removeItem(id);
      setProfiles(profiles.filter((p) => p.id !== id));
      return true;
    } catch {
      return false;
    }
  };

  return (
    <ProfilesContext.Provider
      value={{
        profiles,
        createProfile,
        readProfile,
        updateProfile,
        deleteProfile,
      }}
    >
      {children}
    </ProfilesContext.Provider>
  );
};

export const useProfiles = () => {
  const context = useContext(ProfilesContext);
  if (!context) {
    throw new Error(
      "useAspectsuseProfilesData must be used within a ProfilesContextProvider"
    );
  }
  return context;
};
