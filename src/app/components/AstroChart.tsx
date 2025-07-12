// app/components/AstroChart.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { getPlanetSymbol } from "../utils/chartUtils";
import {
  HousesData,
  Planet,
  PlanetType,
} from "@/interfaces/BirthChartInterfaces";

interface Props {
  planets: Planet[];
  housesData: HousesData;
}

const AstroChart: React.FC<Props> = ({ planets, housesData }) => {
  const ref = useRef<SVGSVGElement>(null);
  const [rotation, setRotation] = useState(0);

  const getHouseColor = (index: number): string => {
    if (index === 0) {
      return "red";
    } else if (index % 3 === 0) {
      return "black";
    } else {
      return "gray";
    }
  };

  const getRotationDifference = (asc: number) => {
    const nextSignMultiple = Math.floor(asc / 30) + 1;
    const nextSignLongitude = nextSignMultiple * 30;
    const difference = (nextSignLongitude - asc) * 2;
    return difference;
  };

  const zodiacRotation =
    housesData.ascendant - (90 - getRotationDifference(housesData.ascendant));

  useEffect(() => {
    if (!ref.current) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const size = 400;
    const scaleFactor = 1.5;
    const scaledSize = size * scaleFactor;
    const center = size / 2;
    const radius = size / 2 - 40;
    const zodiacRadius = radius + 20;
    const outerZodiacRadius = zodiacRadius + 10;

    const zodiacSigns = [
      { glyph: "♈︎", radius: radius + 15 },
      { glyph: "♉︎", radius: radius + 15 },
      { glyph: "♊︎", radius: radius + 15 },
      { glyph: "♋︎", radius: radius + 15 },
      { glyph: "♌︎", radius: radius + 15 },
      { glyph: "♍︎", radius: radius + 14 },
      { glyph: "♎︎", radius: radius + 13 },
      { glyph: "♏︎", radius: radius + 15 },
      { glyph: "♐︎", radius: radius + 14 },
      { glyph: "♑︎", radius: radius + 15 },
      { glyph: "♒︎", radius: radius + 16 },
      { glyph: "♓︎", radius: radius + 15 },
    ];

    const signElements: Record<string, string> = {
      "♈︎": "Fogo",
      "♉︎": "Terra",
      "♊︎": "Ar",
      "♋︎": "Água",
      "♌︎": "Fogo",
      "♍︎": "Terra",
      "♎︎": "Ar",
      "♏︎": "Água",
      "♐︎": "Fogo",
      "♑︎": "Terra",
      "♒︎": "Ar",
      "♓︎": "Água",
    };

    const elementColors: Record<string, string> = {
      Fogo: "red",
      Terra: "green",
      Ar: "orange",
      Água: "blue",
    };

    const baseGroup = svg
      .attr("width", scaledSize)
      .attr("height", scaledSize)
      .append("g")
      .attr("transform", `translate(${center}, ${center})`)
      .attr(
        "transform",
        `translate(${center * scaleFactor}, ${
          center * scaleFactor
        }) scale(${scaleFactor})`
      );

    // Eixos centrais
    baseGroup
      .append("line")
      .attr("x1", -radius)
      .attr("y1", 0)
      .attr("x2", radius)
      .attr("y2", 0)
      .attr("stroke", "black")
      .attr("stroke-width", 1);

    baseGroup
      .append("line")
      .attr("x1", 0)
      .attr("y1", -radius)
      .attr("x2", 0)
      .attr("y2", radius)
      .attr("stroke", "black")
      .attr("stroke-width", 1);

    /*
          AQUUIIII
     */

    // Círculo externo dos signos
    baseGroup
      .append("circle")
      .attr("r", outerZodiacRadius)
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 1);

    // Grupo que será rotacionado para alinhar os signos com o Ascendente
    // console.log("ascendant: ", housesData.ascendant);
    // console.log("zodiacRotation: ", zodiacRotation);

    const zodiacGroup = baseGroup
      .append("g")
      .attr("transform", `rotate(${-zodiacRotation})`);

    // Divisões dos signos (linhas externas)
    for (let i = 0; i < 12; i++) {
      const angle = 360 - ((i * 30) % 360);
      const angleRad = (angle * Math.PI) / 180;
      const x1 = radius * Math.cos(angleRad);
      const y1 = radius * Math.sin(angleRad);
      const x2 = outerZodiacRadius * Math.cos(angleRad);
      const y2 = outerZodiacRadius * Math.sin(angleRad);

      zodiacGroup
        .append("line")
        .attr("x1", x1)
        .attr("y1", y1)
        .attr("x2", x2)
        .attr("y2", y2)
        .attr("stroke", "black")
        .attr("stroke-width", 1);
      // .attr("transform", `rotate(${rotation})`);
    }

    //Glifos dos signos centralizados nas fatias com cor por elemento
    zodiacSigns.forEach((sign, i) => {
      const middleAngle = 360 - ((i * 30 + 15 + 180) % 360) - 90;
      const angleRad = (middleAngle * Math.PI) / 180;
      const x = sign.radius * Math.cos(angleRad);
      const y = sign.radius * Math.sin(angleRad);

      const element = signElements[sign.glyph];
      const color = elementColors[element];

      zodiacGroup
        .append("text")
        .attr("x", x)
        .attr("y", y)
        .attr("font-size", 16)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .attr("fill", color)
        .attr("transform", `rotate(${zodiacRotation}, ${x}, ${y})`)
        .text(sign.glyph);
    });

    const housesRotation = housesData.ascendant - 90;
    const rotatedGroup = baseGroup
      .append("g")
      .attr("transform", `rotate(${housesRotation})`);

    rotatedGroup
      .append("circle")
      .attr("r", radius)
      .attr("fill", "white")
      .attr("stroke", "black")
      .attr("stroke-width", 2);

    // Houses
    const angles = housesData.house;
    for (let i = 0; i < 12; i++) {
      const isAngularHouse = i % 3 === 0;
      const start = angles[i];
      const end = angles[(i + 1) % 12];
      let span = (end - start + 360) % 360;
      if (span === 0) span = 360;

      // Converte graus para radianos e inverte o sinal
      // Converte o cuspide em ângulo relativo ao SVG:
      // 0° de Áries no topo e sentido anti‑horário
      const angleDeg = -start - 90;
      const angleRad = (angleDeg * Math.PI) / 180;

      // Linha do centro até o círculo das casas
      const x2 = radius * Math.cos(angleRad);
      const y2 = radius * Math.sin(angleRad);

      rotatedGroup
        .append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", x2)
        .attr("y2", y2)
        .attr("stroke", getHouseColor(i))
        .attr("stroke-width", isAngularHouse ? 2 : 1); // traço mais grosso nas angulares
      // .attr("stroke-width", i === 0 ? 3 : 1); // traço mais grosso nas angulares

      // Número da casa (também anti‑horário)
      // posição média do setor (graus zodiacais, 0° Áries = topo)
      const midDeg = (start + span / 2) % 360;

      // converter para ângulo SVG anti‑horário:
      // - midDeg graus no zodíaco fixo
      // - 0° Áries = -90° no SVG
      const angleSVG = -midDeg - 90;
      const rad = (angleSVG * Math.PI) / 180;

      // raio interno onde ficará o número
      const numRadius = radius - 30;
      const x = numRadius * Math.cos(rad);
      const y = numRadius * Math.sin(rad);

      const houseCountRotation = housesData.ascendant - 90;

      rotatedGroup
        .append("text")
        .attr("x", x)
        .attr("y", y)
        .attr("font-size", 10)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .attr("transform", `rotate(${-houseCountRotation}, ${x}, ${y})`)
        .text((i + 1).toString());
    }

    // Graduações de grau (a cada 10°)
    for (let deg = 0; deg < 360; deg += 10) {
      const angleSVG = 360 - deg - 90;
      const rad = (angleSVG * Math.PI) / 180;

      const inner = outerZodiacRadius;
      const outer = outerZodiacRadius + 12; // aumenta comprimento (de +6 para +12)
      const x1 = inner * Math.cos(rad);
      const y1 = inner * Math.sin(rad);
      const x2 = outer * Math.cos(rad);
      const y2 = outer * Math.sin(rad);

      // note: aplicamos a rotação no grupo ou diretamente na linha —
      // se tudo já estiver dentro de zodiacGroup, remova o transform aqui
      zodiacGroup
        .append("line")
        .attr("x1", x1)
        .attr("y1", y1)
        .attr("x2", x2)
        .attr("y2", y2)
        .attr("stroke", "black")
        .attr("stroke-width", 1);
    }

    // Marcas menores a cada 5° (entre as de 10°)
    for (let deg = 5; deg < 360; deg += 10) {
      const angleSVG = 360 - deg - 90;
      const rad = (angleSVG * Math.PI) / 180;

      const inner = outerZodiacRadius;
      const outer = outerZodiacRadius + 8; // um pouco menor que as de 10°
      const x1 = inner * Math.cos(rad);
      const y1 = inner * Math.sin(rad);
      const x2 = outer * Math.cos(rad);
      const y2 = outer * Math.sin(rad);

      zodiacGroup
        .append("line")
        .attr("x1", x1)
        .attr("y1", y1)
        .attr("x2", x2)
        .attr("y2", y2)
        .attr("stroke", "black")
        .attr("stroke-width", 1);
    }

    planets.forEach((planet) => {
      // calcula o ângulo para posicionar no zodíaco fixo
      const angle = 180 - (planet.longitude % 360) - 90;
      const angleRad = (angle * Math.PI) / 180;

      const x = (radius - 20) * Math.cos(angleRad);
      const y = (radius - 20) * Math.sin(angleRad);

      // Desenha linha do planeta até o círculo das casas
      const xEdge = radius * Math.cos(angleRad);
      const yEdge = radius * Math.sin(angleRad);

      baseGroup
        .append("line")
        .attr("x1", x)
        .attr("y1", y)
        .attr("x2", xEdge)
        .attr("y2", yEdge)
        .attr("stroke", "black")
        .attr("transform", `rotate(${-zodiacRotation})`)
        .attr("stroke-width", 1);

      // Desenha o símbolo do planeta
      // usa planet.sign para mapear: ex. "Sol" → chave "sun"
      const symbol = getPlanetSymbol(planet.type);
      baseGroup
        .append("text")
        .attr("x", x)
        .attr("y", y)
        .attr("font-size", 14)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .attr("transform", `rotate(${-zodiacRotation})`)
        .text(symbol);
    });
  }, [planets, housesData, rotation]);

  return (
    <div className="flex flex-col justify-center items-center">
      <input
        type="number"
        className="border-1 mb-4"
        onChange={(e) => setRotation(Number.parseFloat(e.target.value))}
      />
      <svg ref={ref}></svg>
    </div>
  );
};

export default AstroChart;
