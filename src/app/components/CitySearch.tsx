"use client";

import { useBirthChart } from "@/contexts/BirthChartContext";
import { SelectedCity } from "@/interfaces/BirthChartInterfaces";
import { useState, useEffect, useRef } from "react";

interface CityResult {
  display_name: string;
  lat: string;
  lon: string;
}

export default function CitySearch({
  initialCoordinates,
  onSelect,
}: {
  initialCoordinates?: SelectedCity;
  onSelect: (city: SelectedCity) => void;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(initialCoordinates?.name ?? "");
  const [results, setResults] = useState<CityResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState(false);
  const [queryError, setQueryError] = useState(false);

  const canQuery = useRef(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setResults([]);
        setQueryError(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      canQuery.current = false;
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!canQuery.current) return;
    if (query.length <= 1) setSelectedCity(false);
    if (query.length < 3 || selectedCity) return;

    const controller = new AbortController();
    const signal = controller.signal;

    const timeout = setTimeout(() => {
      setIsLoading(true);
      if (queryError) setQueryError(false);

      (async () => {
        try {
          const res = await fetch(
            `/api/nominatim?q=${encodeURIComponent(query)}`,
            { signal }
          );
          if (!res.ok) {
            // 4xx/5xx do proxy ou do Nominatim repassado pelo proxy
            console.error(
              "Nominatim proxy respondeu:",
              res.status,
              await res.text()
            );
            setQueryError(true);
            setResults([]);
            return;
          }

          const data = await res.json();
          if (!Array.isArray(data) || data.length === 0) {
            setQueryError(true);
            setResults([]);
          } else {
            if (queryError) setQueryError(false);
            setResults(data);
          }
        } catch (err: any) {
          if (err.name === "AbortError") {
            // fetch abortado — sem erro
            return;
          }
          console.error("Erro na busca de cidades (proxy):", err);
          setQueryError(true);
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      })();
    }, 500); // debounce

    return () => {
      clearTimeout(timeout);
      controller.abort(); // cancela fetch pendente ao mudar query/unmount
    };
  }, [query, selectedCity]); // adicione outras deps relevantes

  return (
    <div ref={wrapperRef} className="flex flex-col gap-1 mb-5">
      <input
        required
        className="border-2 p-1 rounded"
        type="text"
        placeholder="Digite a cidade"
        value={query}
        onChange={(e) => {
          if (!canQuery.current) {
            canQuery.current = true;
          }
          setQuery(e.target.value);
        }}
      />

      <div className="relative">
        <div className="absolute">
          {isLoading && <p>Buscando...</p>}
          {queryError && <p>Sem resultados.</p>}
        </div>

        {results.length > 0 && !isLoading && (
          <ul className="absolute bg-white border rounded shadow p-2">
            {results.map((city, index) => (
              <li
                key={index}
                className="cursor-pointer hover:bg-gray-100 p-1"
                onClick={() => {
                  onSelect({
                    name: city.display_name,
                    latitude: parseFloat(city.lat),
                    longitude: parseFloat(city.lon),
                  });
                  setQuery(city.display_name); // opcional: coloca o nome no input
                  setResults([]);
                  setSelectedCity(true);
                }}
              >
                {city.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
