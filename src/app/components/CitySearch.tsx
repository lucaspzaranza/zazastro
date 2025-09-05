import { SelectedCity } from "@/interfaces/BirthChartInterfaces";
import { useState, useEffect, useRef } from "react";

interface CityResult {
  display_name: string;
  lat: string;
  lon: string;
}

export default function CitySearch({
  onSelect,
}: {
  onSelect: (city: SelectedCity) => void;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CityResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState(false);
  const [queryError, setQueryError] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        // console.log("Clicou fora do componente!");
        setResults([]);
        setQueryError(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (query.length <= 1) setSelectedCity(false);

    if (query.length < 3 || selectedCity) return;

    const timeout = setTimeout(() => {
      setIsLoading(true);
      if (queryError) {
        setQueryError(false);
      }
      fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query
        )}&format=json&limit=5&addressdetails=1`,
        {
          headers: {
            "User-Agent": "Zazastro/1.0 (lucaszaranza@gmail.com)",
          },
        }
      )
        .then((res) => res.json())
        .then((data) => {
          // console.log("resultados encontrados:", data);
          if (data.length === 0) {
            setQueryError(true);
          } else {
            if (queryError) {
              setQueryError(false);
            }
            setResults(data);
          }
        })
        .catch((err) => console.error("Erro na busca de cidades:", err))
        .finally(() => setIsLoading(false));
    }, 500); // debounce de 500ms

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div ref={wrapperRef} className="flex flex-col gap-1 mb-5">
      <input
        required
        className="border-2 p-1 rounded"
        type="text"
        placeholder="Digite a cidade"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
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
