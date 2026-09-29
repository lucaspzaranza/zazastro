"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function useChartNavigation() {
  const router = useRouter();
  const [navigating, setNavigating] = useState(false);

  const navigate = (url: string) => {
    setNavigating(true);
    router.push(url);
  };

  return { navigating, navigate };
}