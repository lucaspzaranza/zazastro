// src/app/components/InitialProfileSync.tsx
"use client";
import { useEffect, useRef } from "react";
import { useProfiles } from "@/contexts/ProfilesContext";

export default function InitialProfileSync() {
  const { profiles, updateCurrentSelectedProfile } = useProfiles();
  const done = useRef(false);

  useEffect(() => {
    if (profiles.length > 0 && !done.current) {
      updateCurrentSelectedProfile(profiles[0]);
      done.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profiles]);

  return null;
}