"use client";

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
  createProfile: (profile: BirthChartProfile) => BirthChartProfile | undefined;
  importProfiles: (importedProfiles: BirthChartProfile[]) => { imported: number; skipped: number };
  deleteAllProfiles: () => number;
  readProfile: (id: string) => BirthChartProfile | null;
  updateProfile: (id: string, profile: BirthChartProfile) => boolean;
  deleteProfile: (id: string) => boolean;
  currentProfile?: BirthChartProfile;
  updateCurrentSelectedProfile: (newProfile: BirthChartProfile | undefined) => void;
  sinastryProfile?: BirthChartProfile;
  updateSinastryProfile: (newProfile: BirthChartProfile | undefined) => void;
  getNextHumanProfile: (baseProfile: BirthChartProfile) => BirthChartProfile | undefined;
}

const PROFILE_KEY = "zazastro:profile-";
const PROFILE_ID_PATTERN = /^zazastro:profile-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ProfilesContext = createContext<ProfilesContextType | undefined>(
  undefined
);

export const ProfilesContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [profiles, setProfiles] = useState<BirthChartProfile[]>([]);
  const [currentProfile, setCurrentProfile] = useState<BirthChartProfile | undefined>(undefined);
  const [sinastryProfile, setSinastryProfile] = useState<BirthChartProfile | undefined>(undefined);

  useEffect(() => {
    let array: BirthChartProfile[] = [];
    // localStorage.clear();
    // console.log(localStorage);

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key === null || !key.startsWith(PROFILE_KEY)) continue;

      const rawProfile = localStorage.getItem(key);
      if (rawProfile !== null) {
        // console.log(rawProfile);

        const parsed = JSON.parse(rawProfile);
        array.push(parsed);
      }
    }

    array = array.sort((a, b) => (a.name! > b.name! ? 1 : -1));

    if (array.length > 0) {
      setProfiles([...array]);
    }
  }, []);

  const updateCurrentSelectedProfile = (newProfile: BirthChartProfile | undefined) => {
    setCurrentProfile(newProfile);
  }

  const updateSinastryProfile = (newProfile: BirthChartProfile | undefined) => {
    setSinastryProfile(newProfile);
  }

  const createProfile = (profile: BirthChartProfile): BirthChartProfile | undefined => {
    try {
      const id = uuidv4();
      const profileID = PROFILE_KEY + id;
      const profileWithId: BirthChartProfile = {
        ...profile,
        id: profileID,
      };

      localStorage.setItem(profileID, JSON.stringify(profileWithId));
      let array = [...profiles, profileWithId];
      array = array.sort((a, b) => (a.name! > b.name! ? 1 : -1));

      setProfiles(array.map((a) => ({ ...a })));
      return profileWithId;
    } catch {
      return undefined;
    }
  };

  const importProfiles = (importedProfiles: BirthChartProfile[]) => {
    const existingIds = new Set(profiles.map((profile) => profile.id).filter((id): id is string => !!id));
    let imported = 0;
    let skipped = 0;
    const added: BirthChartProfile[] = [];

    for (const profile of importedProfiles) {
      if (!profile.id || !PROFILE_ID_PATTERN.test(profile.id) || existingIds.has(profile.id) || localStorage.getItem(profile.id) !== null) {
        skipped++;
        continue;
      }

      try {
        localStorage.setItem(profile.id, JSON.stringify(profile));
        existingIds.add(profile.id);
        added.push(profile);
        imported++;
      } catch {
        skipped++;
      }
    }

    if (added.length > 0) {
      setProfiles((current) => [...current, ...added].sort((a, b) => (a.name ?? "") > (b.name ?? "") ? 1 : -1));
    }

    return { imported, skipped };
  };

  const deleteAllProfiles = () => {
    const profileIds: string[] = [];
    for (let index = 0; index < localStorage.length; index++) {
      const key = localStorage.key(index);
      if (key?.startsWith(PROFILE_KEY)) profileIds.push(key);
    }

    profileIds.forEach((id) => localStorage.removeItem(id));
    setProfiles([]);
    setCurrentProfile(undefined);
    setSinastryProfile(undefined);
    return profileIds.length;
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

  const getNextHumanProfile = (baseProfile: BirthChartProfile): BirthChartProfile | undefined => {
    let index = profiles.findIndex((p) => p.id === baseProfile.id);
    if (index === -1) return undefined;
    
    while(index < profiles.length) {
      const nextProfile = profiles[index + 1];
      if(nextProfile.gender !== "event") return nextProfile;
      index++;
    }
    
    return undefined;
  }

  return (
    <ProfilesContext.Provider
      value={{
        profiles,
        createProfile,
        importProfiles,
        deleteAllProfiles,
        readProfile,
        updateProfile,
        deleteProfile,
        currentProfile,
        updateCurrentSelectedProfile,
        sinastryProfile,
        updateSinastryProfile,
        getNextHumanProfile
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
