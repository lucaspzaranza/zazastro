import { SelectedCity } from "@/interfaces/BirthChartInterfaces";
import { useState, useEffect } from "react";

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
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CityResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState(false);

  useEffect(() => {
    if (query.length === 0) setSelectedCity(false);

    if (query.length < 3 || selectedCity) return;

    const timeout = setTimeout(() => {
      setIsLoading(true);
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
        .then((data) => setResults(data))
        .catch((err) => console.error("Erro na busca de cidades:", err))
        .finally(() => setIsLoading(false));
    }, 500); // debounce de 500ms

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="flex flex-col gap-1">
      <input
        className="border p-2 rounded"
        type="text"
        placeholder="Digite a cidade"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {isLoading && <p>Buscando...</p>}

      {results.length > 0 && (
        <ul className="bg-white border rounded shadow p-2">
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
  );
}
