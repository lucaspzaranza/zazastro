"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import {
  arabicPartKeys,
  getPlanetSymbol,
  planetOverlapData,
} from "../utils/chartUtils";
import {
  HousesData,
  Planet,
  PlanetOverlap,
  PlanetType,
} from "@/interfaces/BirthChartInterfaces";
import { useArabicParts } from "@/contexts/ArabicPartsContext";
import { ArabicPart, ArabicParts } from "@/interfaces/ArabicPartInterfaces";

interface Props {
  planets: Planet[];
  housesData: HousesData;
  arabicParts?: ArabicParts;
  outerPlanets?: Planet[];
  outerHouses?: HousesData;
  outerArabicParts?: ArabicParts;
  combineWithBirthChart?: () => void;
}

interface PartsAndPlanets {
  longitudeRaw: number;
  name: string;
}

const AstroChart: React.FC<Props> = ({
  planets,
  housesData,
  arabicParts,
  outerPlanets,
  outerHouses,
  outerArabicParts,
  combineWithBirthChart,
}) => {
  const ref = useRef<SVGSVGElement>(null);
  const [rotation, setRotation] = useState(0);
  const [showArabicParts, setShowArabicParts] = useState(false);
  const [showPlanetsAntiscia, setShowPlanetsAntiscia] = useState(false);
  const [showArabicPartsAntiscia, setShowArabicPartsAntiscia] = useState(false);
  const [showOuterchart, setShowOuterChart] = useState(
    outerPlanets !== undefined && outerHouses !== undefined
  );

  const zodiacRotation = 270 - housesData.ascendant;

  // mapeamento das siglas das casas angulares
  const angularLabels: Record<number, string> = {
    0: "AC", // Casa 1 – Ascendente
    3: "IC", // Casa 4 – Fundo do Céu
    6: "DC", // Casa 7 – Descendente
    9: "MC", // Casa 10 – Meio do Céu
  };

  const getOverlappedPlanets = (planet: Planet) => {
    const planetOverlap = planetOverlapData[planet.type];

    const overlappedPlanets: Planet[] = planets.filter((p) => {
      const dist = p.longitudeRaw - planet.longitudeRaw;
      const wrappedDist = // Segundo condicional caso a distância dê um valor perto de 360
        dist < 0 || dist > 360 - planetOverlap.thresholdDeg ? dist - 360 : dist;
      const mod = Math.abs(wrappedDist % 360);
      const distance = mod;
      return distance < planetOverlap.thresholdDeg;
    });

    const sorted = overlappedPlanets.sort((a, b) =>
      Math.abs((a.longitudeRaw - b.longitudeRaw - 360) % 360)
    );

    return sorted;
  };

  const getOverlappedArabicParts = (arabicPart: ArabicPart) => {
    if (arabicParts === undefined) return;

    const thresholdDeg = 3.5;
    let partsAndPlanets: PartsAndPlanets[] = [];

    planets.forEach((p) => {
      partsAndPlanets.push({ longitudeRaw: p.longitudeRaw, name: p.type });
    });

    arabicPartKeys.forEach((key) => {
      const part = arabicParts[key]!;
      partsAndPlanets.push({ longitudeRaw: part.longitudeRaw, name: key });
    });

    const overlappedArabicParts = partsAndPlanets.filter((p) => {
      const dist = p.longitudeRaw - arabicPart.longitudeRaw;
      const wrappedDist = // Segundo condicional caso a distância dê um valor perto de 360
        dist < 0 || dist > 360 - thresholdDeg ? dist - 360 : dist;
      const mod = Math.abs(wrappedDist % 360);
      const distance = mod;
      return distance < thresholdDeg;
    });

    const sorted = overlappedArabicParts.sort((a, b) =>
      Math.abs((a.longitudeRaw - b.longitudeRaw - 360) % 360)
    );

    return sorted;
  };

  const getOverlappedArabicPartsAntiscion = (arabicPart: ArabicPart) => {
    if (arabicParts === undefined) return;

    const thresholdDeg = 3.5;
    let partsAndPlanets: PartsAndPlanets[] = [];

    planets.forEach((p) => {
      partsAndPlanets.push({ longitudeRaw: p.longitudeRaw, name: p.type });
    });

    arabicPartKeys.forEach((key) => {
      const part = arabicParts[key]!;
      partsAndPlanets.push({
        longitudeRaw: showPlanetsAntiscia
          ? part.longitudeRaw
          : part.antiscionRaw,
        name: key,
      });
    });

    const overlappedArabicParts = partsAndPlanets.filter((p) => {
      const dist = p.longitudeRaw - arabicPart.longitudeRaw;
      const wrappedDist = // Segundo condicional caso a distância dê um valor perto de 360
        dist < 0 || dist > 360 - thresholdDeg ? dist - 360 : dist;
      const mod = Math.abs(wrappedDist % 360);
      const distance = mod;
      return distance < thresholdDeg;
    });

    const sorted = overlappedArabicParts.sort((a, b) =>
      Math.abs((a.longitudeRaw - b.longitudeRaw - 360) % 360)
    );

    return sorted;
  };

  useEffect(() => {
    if (!ref.current) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const size = 400;
    const scaleFactor = showOuterchart ? 1.25 : 1.5;
    const scaledSize = size * scaleFactor;
    const center = size / 2;
    const radius = size / 2 - 40;
    const zodiacRadius = radius + 20;
    const outerZodiacRadius = zodiacRadius + 10;
    const outerChartBorderRadius = outerZodiacRadius + 50;

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
      .style("overflow", "visible")
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

    if (showOuterchart) {
      baseGroup
        .append("circle")
        .attr("r", outerChartBorderRadius)
        .attr("fill", "#f0ffff")
        .attr("stroke", "black")
        .attr("stroke-width", 1);
    }

    // Círculo externo dos signos
    baseGroup
      .append("circle")
      .attr("r", outerZodiacRadius)
      .attr("fill", "white")
      .attr("stroke", "black")
      .attr("stroke-width", 1);

    // Grupo que será rotacionado para alinhar os signos com o Ascendente
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
      .attr("stroke-width", 1);

    // 1) Defina os raios dos dois círculos menores (diâmetro = 1/4 do diâmetro maior)
    const smallOuterRadius = radius / 1.5;
    const smallInnerRadius = smallOuterRadius - 20; // ajuste o “gap” entre círculos

    // 2) Desenhe os dois círculos concentricamente
    const centerCircles = baseGroup.append("g");

    centerCircles
      .append("circle")
      .attr("r", smallInnerRadius)
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 0.5);

    centerCircles
      .append("circle")
      .attr("r", smallOuterRadius)
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 0.5);

    // 3) Posicione os números das casas no anel entre esses círculos
    const midRadius = (smallInnerRadius + smallOuterRadius) / 2;

    // normaliza Ascendente e cuspides
    const asc = ((housesData.ascendant % 360) + 360) % 360;
    const cusps = housesData.house.map((a) => ((a % 360) + 360) % 360);

    // Números das casas.
    // Percorre 0 a 11 diretamente (já é anti‑horário começando no Ascendente)
    for (let j = 0; j < 12; j++) {
      const startDeg = cusps[j];
      const endDeg = cusps[(j + 1) % 12];

      let span = (endDeg - startDeg + 360) % 360;
      if (span === 0) span = 360;
      const midDeg = startDeg + span / 2;

      const degFromAsc = (midDeg - asc + 360) % 360;

      // **AQUI**: invertendo para anti‑horário
      const angleRad = Math.PI - (degFromAsc * Math.PI) / 180;

      const x = midRadius * Math.cos(angleRad);
      const y = midRadius * Math.sin(angleRad);

      let txt = (j + 1).toString();
      if (showOuterchart && j % 3 === 0) {
        // angular house
        txt = angularLabels[j];
      }

      centerCircles
        .append("text")
        .attr("x", x)
        .attr("y", y)
        .attr("font-size", 10)
        .attr("text-anchor", "middle")
        .attr("font-weight", showOuterchart && j % 3 === 0 ? "bold" : "plain")
        .attr("alignment-baseline", "middle")
        .text(txt);
    }

    const innerCircleRadius = smallInnerRadius; // ou o valor que você estiver usando
    // parâmetros de styling
    const houseLineStrokeWidth = (i: number) => (i % 3 === 0 ? 2 : 0.5);

    const continuationLength = 25; // comprimento do traço de continuidade
    const labelOffset = 25; // distância extra para posicionar o texto

    // desenha cada cúspide das casas
    for (let i = 0; i < 12; i++) {
      const start = cusps[i];
      const angleRad = ((-start - 90) * Math.PI) / 180;

      // ponto inicial da linha (já definido por você)
      const x1 = i % 3 === 0 ? 0 : innerCircleRadius * Math.cos(angleRad);
      const y1 = i % 3 === 0 ? 0 : innerCircleRadius * Math.sin(angleRad);
      // ponto final da cúspide
      const x2 = radius * Math.cos(angleRad);
      const y2 = radius * Math.sin(angleRad);

      // desenha a cúspide
      rotatedGroup
        .append("line")
        .attr("x1", x1)
        .attr("y1", y1)
        .attr("x2", x2)
        .attr("y2", y2)
        .attr("stroke", "black")
        .attr("stroke-width", houseLineStrokeWidth(i));

      // Só para as casas angulares, adiciona traço e sigla
      if (!showOuterchart && i % 3 === 0) {
        // 1) pequeno traço de continuidade
        const originLineX = outerZodiacRadius * Math.cos(angleRad);
        const originLineY = outerZodiacRadius * Math.sin(angleRad);

        const finalLineX = (outerZodiacRadius + 12) * Math.cos(angleRad);
        const finalLineY = (outerZodiacRadius + 12) * Math.sin(angleRad);

        // 2) sigla da casa
        const labelRadius = radius + continuationLength + labelOffset;
        const lx = labelRadius * Math.cos(angleRad);
        const ly = labelRadius * Math.sin(angleRad);

        rotatedGroup
          .append("text")
          .attr("x", lx)
          .attr("y", ly)
          .attr("font-size", 12)
          .attr("text-anchor", "middle")
          .attr("alignment-baseline", "middle")
          .attr("transform", `rotate(${-housesRotation}, ${lx}, ${ly})`)
          .text(angularLabels[i]);

        rotatedGroup
          .append("line")
          .attr("x1", originLineX)
          .attr("y1", originLineY)
          .attr("x2", finalLineX)
          .attr("y2", finalLineY)
          .attr("stroke", "black")
          .attr("stroke-width", 2);
      }
    }

    if (!showOuterchart) {
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
    }

    const lineStartOffset = 6; // quão “para dentro” a linha começa

    // Desenha os planetas
    planets.forEach((planet) => {
      const overlappedPlanets = getOverlappedPlanets(planet);
      const overlapIndex =
        overlappedPlanets.length > 0 ? overlappedPlanets.indexOf(planet) : 0;
      const prevPlanet = overlappedPlanets[overlapIndex - 1]; // previous planet edge overlap data
      const planetOverlap =
        prevPlanet !== undefined
          ? planetOverlapData[prevPlanet.type]
          : planetOverlapData[planet.type];

      // 1) ângulo zodiacal original (graus → rad)
      const rawDeg = 180 - (planet.longitude % 360) - 90;
      const rawRad = (rawDeg * Math.PI) / 180;

      // 2) compensa a rotação do zodíaco (transforma em ângulo final)
      const rotRad = (zodiacRotation * Math.PI) / 180;
      const angleRad = rawRad - rotRad;

      // 3) offsets de sobreposição
      const idx = overlapIndex;
      const symbolOffset =
        planetOverlap.baseSymbolOffset + idx * planetOverlap.overlapGap;
      const rSymbol = radius - symbolOffset;
      const rLineStart = radius - lineStartOffset;
      const rLineEnd = radius;

      // 4) cálculos das coordenadas FINAIS
      const xs = rSymbol * Math.cos(angleRad);
      const ys = rSymbol * Math.sin(angleRad);
      const x1 = rLineStart * Math.cos(angleRad);
      const y1 = rLineStart * Math.sin(angleRad);
      const x2 = rLineEnd * Math.cos(angleRad);
      const y2 = rLineEnd * Math.sin(angleRad);

      // 5) desenha a linha
      baseGroup
        .append("line")
        .attr("x1", x1)
        .attr("y1", y1)
        .attr("x2", x2)
        .attr("y2", y2)
        .attr("stroke", "#ff914d") // antiscion color
        .attr("stroke", "black")
        .attr("stroke-width", 1);

      // 6) desenha o ícone do planeta
      const iconSize = 13; // px
      const iconSrc = `/planets/${planet.type}${
        planet.isRetrograde ? "-rx" : ""
      }.png`;

      baseGroup
        .append("image")
        .attr("href", iconSrc) // no D3 v6+ use 'href'
        .attr("width", iconSize)
        .attr("height", iconSize)
        // centraliza o ícone em (xs, ys)
        .attr("x", xs - iconSize / 2)
        .attr("y", ys - iconSize / 2);

      if (showPlanetsAntiscia) {
        // 1) ângulo zodiacal original (graus → rad)
        const rawAntDeg = 180 - (planet.antiscion % 360) - 90;
        const rawAntRad = (rawAntDeg * Math.PI) / 180;

        // 2) compensa a rotação do zodíaco (transforma em ângulo final)
        const rotAntRad = (zodiacRotation * Math.PI) / 180;
        const angleAntRad = rawAntRad - rotAntRad;

        // 3) offsets de sobreposição
        const antIdx = overlapIndex;
        const symbolAntOffset =
          planetOverlap.baseSymbolOffset + antIdx * planetOverlap.overlapGap;
        const rAntSymbol = radius - symbolAntOffset;
        const rAntLineStart = radius - lineStartOffset;
        const AntLineEnd = radius;

        // 4) cálculos das coordenadas FINAIS
        const xAnts = rAntSymbol * Math.cos(angleAntRad);
        const yAnts = rAntSymbol * Math.sin(angleAntRad);
        const xAnt1 = rAntLineStart * Math.cos(angleAntRad);
        const yAnt1 = rAntLineStart * Math.sin(angleAntRad);
        const xAnt2 = AntLineEnd * Math.cos(angleAntRad);
        const yAnt2 = AntLineEnd * Math.sin(angleAntRad);

        // 5) desenha a linha
        baseGroup
          .append("line")
          .attr("x1", xAnt1)
          .attr("y1", yAnt1)
          .attr("x2", xAnt2)
          .attr("y2", yAnt2)
          .attr("stroke", "#ff914d") // antiscion color
          .attr("stroke-width", 1);

        // 6) desenha o ícone do planeta
        const iconAntSize = planet.type === "northNode" ? 16 : 13; // px
        const iconAntSrc = `/planets/antiscion/${planet.type}${
          planet.isRetrograde ? "-rx" : ""
        }.png`;

        baseGroup
          .append("image")
          .attr("href", iconAntSrc) // no D3 v6+ use 'href'
          .attr("width", iconAntSize)
          .attr("height", iconAntSize)
          // centraliza o ícone em (xs, ys)
          .attr("x", xAnts - iconAntSize / 2)
          .attr("y", yAnts - iconAntSize / 2);
      }
    });

    if (showArabicParts && arabicParts !== undefined) {
      arabicPartKeys.forEach((key) => {
        const lot = arabicParts[key];
        const baseSymbolOffset = 15;
        const overlapGap = 12.5;

        if (lot !== undefined && lot.planet) {
          const overlappedArabicParts = getOverlappedArabicParts(lot)!;

          let overlapIndex = 0;
          overlappedArabicParts.forEach((overlap, index) => {
            if (overlap.longitudeRaw === lot.longitudeRaw) {
              overlapIndex = index;
            }
          });

          // 1) ângulo zodiacal original (graus → rad)
          const rawDeg = 180 - (lot.longitude % 360) - 90;
          const rawRad = (rawDeg * Math.PI) / 180;

          // 2) compensa a rotação do zodíaco (transforma em ângulo final)
          const rotRad = (zodiacRotation * Math.PI) / 180;
          const angleRad = rawRad - rotRad;

          // 3) offsets de sobreposição
          const idx = overlapIndex;
          // console.log(`index of ${lot.name}: ${idx}`);

          const symbolOffset = baseSymbolOffset + idx * overlapGap;
          const rSymbol = radius - symbolOffset;
          const rLineStart = radius - lineStartOffset;
          const rLineEnd = radius;

          // 4) cálculos das coordenadas FINAIS
          const xs = rSymbol * Math.cos(angleRad);
          const ys = rSymbol * Math.sin(angleRad);
          const x1 = rLineStart * Math.cos(angleRad);
          const y1 = rLineStart * Math.sin(angleRad);
          const x2 = rLineEnd * Math.cos(angleRad);
          const y2 = rLineEnd * Math.sin(angleRad);

          // 5) desenha a linha
          baseGroup
            .append("line")
            .attr("x1", x1)
            .attr("y1", y1)
            .attr("x2", x2)
            .attr("y2", y2)
            .attr("stroke", "#ff914d") // antiscion color
            .attr("stroke", "black")
            .attr("stroke-width", 1);

          // 6) desenha o ícone do planeta
          const iconSize = 13; // px
          const iconSrc = `/planets/${key}.png`;

          baseGroup
            .append("image")
            .attr("href", iconSrc) // no D3 v6+ use 'href'
            .attr("width", iconSize)
            .attr("height", iconSize)
            // centraliza o ícone em (xs, ys)
            .attr("x", xs - iconSize / 2)
            .attr("y", ys - iconSize / 2);
        }
      });
    }

    if (showArabicPartsAntiscia && arabicParts !== undefined) {
      arabicPartKeys.forEach((key) => {
        const lot = arabicParts[key];
        const baseSymbolOffset = 15;
        const overlapGap = 12.5;

        if (lot !== undefined && lot.planet) {
          const overlappedArabicParts = getOverlappedArabicPartsAntiscion(lot)!;

          let overlapIndex = 0;
          overlappedArabicParts.forEach((overlap, index) => {
            if (overlap.longitudeRaw === lot.longitudeRaw) {
              overlapIndex = index;
            }
          });

          // 1) ângulo zodiacal original (graus → rad)
          const rawDeg = 180 - (lot.antiscion % 360) - 90;
          const rawRad = (rawDeg * Math.PI) / 180;

          // 2) compensa a rotação do zodíaco (transforma em ângulo final)
          const rotRad = (zodiacRotation * Math.PI) / 180;
          const angleRad = rawRad - rotRad;

          // 3) offsets de sobreposição
          const idx = overlapIndex;
          // console.log(`index of ${lot.name}: ${idx}`);

          const symbolOffset = baseSymbolOffset + idx * overlapGap;
          const rSymbol = radius - symbolOffset;
          const rLineStart = radius - lineStartOffset;
          const rLineEnd = radius;

          // 4) cálculos das coordenadas FINAIS
          const xs = rSymbol * Math.cos(angleRad);
          const ys = rSymbol * Math.sin(angleRad);
          const x1 = rLineStart * Math.cos(angleRad);
          const y1 = rLineStart * Math.sin(angleRad);
          const x2 = rLineEnd * Math.cos(angleRad);
          const y2 = rLineEnd * Math.sin(angleRad);

          // 5) desenha a linha
          baseGroup
            .append("line")
            .attr("x1", x1)
            .attr("y1", y1)
            .attr("x2", x2)
            .attr("y2", y2)
            .attr("stroke", "#ff914d") // antiscion color
            .attr("stroke-width", 1);

          // 6) desenha o ícone do planeta
          const iconSize = 13; // px
          const iconSrc = `/planets/antiscion/${key}.png`;

          baseGroup
            .append("image")
            .attr("href", iconSrc) // no D3 v6+ use 'href'
            .attr("width", iconSize)
            .attr("height", iconSize)
            // centraliza o ícone em (xs, ys)
            .attr("x", xs - iconSize / 2)
            .attr("y", ys - iconSize / 2);
        }
      });
    }

    if (showOuterchart && outerHouses) {
      // const ascOuter = ((outerHouses.ascendant % 360) + 360) % 360;
      const cuspsOuter = outerHouses.house.map((a) => ((a % 360) + 360) % 360);

      // desenha cada cúspide das casas
      for (let i = 0; i < 12; i++) {
        const start = cuspsOuter[i];
        const angleRad = ((-start - 90) * Math.PI) / 180;

        // ponto inicial da linha (já definido por você)
        const x1 = outerChartBorderRadius * Math.cos(angleRad);
        const y1 = outerChartBorderRadius * Math.sin(angleRad);
        // ponto final da cúspide
        const x2 = outerZodiacRadius * Math.cos(angleRad);
        const y2 = outerZodiacRadius * Math.sin(angleRad);

        // desenha a cúspide
        rotatedGroup
          .append("line")
          .attr("x1", x1)
          .attr("y1", y1)
          .attr("x2", x2)
          .attr("y2", y2)
          .attr("stroke", "black")
          .attr("stroke-width", houseLineStrokeWidth(i));
      }

      // Números das casas.
      // Percorre 0 a 11 diretamente (já é anti‑horário começando no Ascendente)
      for (let j = 0; j < 12; j++) {
        const startDeg = cuspsOuter[j];
        const endDeg = cuspsOuter[(j + 1) % 12];

        let span = (endDeg - startDeg + 360) % 360;
        if (span === 0) span = 360;
        // const midDeg = startDeg + span / 2;
        const degOffset = 2;
        const midDeg = startDeg + degOffset;

        const degFromAsc = (midDeg - asc + 360) % 360;

        // **AQUI**: invertendo para anti‑horário
        const angleRad = Math.PI - (degFromAsc * Math.PI) / 180;
        const outerCuspRadius = outerChartBorderRadius - 10;
        const x = outerCuspRadius * Math.cos(angleRad);
        const y = outerCuspRadius * Math.sin(angleRad);

        let txt = (j + 1).toString();
        if (j % 3 === 0) {
          // angular house
          txt = angularLabels[j];
        }

        centerCircles
          .append("text")
          .attr("x", x)
          .attr("y", y)
          .attr("font-size", 10)
          .attr("text-anchor", "middle")
          .attr("font-weight", j % 3 === 0 ? "bold" : "plain")
          .attr("alignment-baseline", "middle")
          .text(txt);
      }
    }

    // Offset pros planetas e partes árabes
    const symbolOffset = 16;

    if (showOuterchart && outerPlanets) {
      outerPlanets.forEach((planet) => {
        const overlappedPlanets = getOverlappedPlanets(planet);
        const overlapIndex =
          overlappedPlanets.length > 0 ? overlappedPlanets.indexOf(planet) : 0;
        const prevPlanet = overlappedPlanets[overlapIndex - 1]; // previous planet edge overlap data
        const planetOverlap =
          prevPlanet !== undefined
            ? planetOverlapData[prevPlanet.type]
            : planetOverlapData[planet.type];

        // 1) ângulo zodiacal original (graus → rad)
        const rawDeg = 180 - (planet.longitude % 360) - 90;
        const rawRad = (rawDeg * Math.PI) / 180;

        // 2) compensa a rotação do zodíaco (transforma em ângulo final)
        const rotRad = (zodiacRotation * Math.PI) / 180;
        const angleRad = rawRad - rotRad;

        // 3) offsets de sobreposição
        const idx = overlapIndex;
        // const symbolOffset =
        //   planetOverlap.baseSymbolOffset + idx * planetOverlap.overlapGap;

        const rSymbol = outerZodiacRadius + symbolOffset;
        const rLineStart = outerZodiacRadius + lineStartOffset;
        const rLineEnd = outerZodiacRadius;

        // 4) cálculos das coordenadas FINAIS
        const xs = rSymbol * Math.cos(angleRad);
        const ys = rSymbol * Math.sin(angleRad);
        const x1 = rLineStart * Math.cos(angleRad);
        const y1 = rLineStart * Math.sin(angleRad);
        const x2 = rLineEnd * Math.cos(angleRad);
        const y2 = rLineEnd * Math.sin(angleRad);

        // 5) desenha a linha
        baseGroup
          .append("line")
          .attr("x1", x1)
          .attr("y1", y1)
          .attr("x2", x2)
          .attr("y2", y2)
          .attr("stroke", "black")
          .attr("stroke-width", 1);

        // 6) desenha o ícone do planeta
        const iconSize = 13; // px
        const iconSrc = `/planets/${planet.type}${
          planet.isRetrograde ? "-rx" : ""
        }.png`;

        baseGroup
          .append("image")
          .attr("href", iconSrc) // no D3 v6+ use 'href'
          .attr("width", iconSize)
          .attr("height", iconSize)
          // centraliza o ícone em (xs, ys)
          .attr("x", xs - iconSize / 2)
          .attr("y", ys - iconSize / 2);

        if (showPlanetsAntiscia) {
          // 1) ângulo zodiacal original (graus → rad)
          const rawAntDeg = 180 - (planet.antiscion % 360) - 90;
          const rawAntRad = (rawAntDeg * Math.PI) / 180;

          // 2) compensa a rotação do zodíaco (transforma em ângulo final)
          const rotAntRad = (zodiacRotation * Math.PI) / 180;
          const angleAntRad = rawAntRad - rotAntRad;

          // 3) offsets de sobreposição
          const antIdx = overlapIndex;
          // const symbolAntOffset =
          //   planetOverlap.baseSymbolOffset + antIdx * planetOverlap.overlapGap;
          const rAntSymbol = outerZodiacRadius + symbolOffset;
          const rAntLineStart = outerZodiacRadius + lineStartOffset;
          const AntLineEnd = outerZodiacRadius;

          // 4) cálculos das coordenadas FINAIS
          const xAnts = rAntSymbol * Math.cos(angleAntRad);
          const yAnts = rAntSymbol * Math.sin(angleAntRad);
          const xAnt1 = rAntLineStart * Math.cos(angleAntRad);
          const yAnt1 = rAntLineStart * Math.sin(angleAntRad);
          const xAnt2 = AntLineEnd * Math.cos(angleAntRad);
          const yAnt2 = AntLineEnd * Math.sin(angleAntRad);

          // 5) desenha a linha
          baseGroup
            .append("line")
            .attr("x1", xAnt1)
            .attr("y1", yAnt1)
            .attr("x2", xAnt2)
            .attr("y2", yAnt2)
            .attr("stroke", "#ff914d") // antiscion color
            .attr("stroke-width", 1);

          // 6) desenha o ícone do planeta
          const iconAntSize = planet.type === "northNode" ? 16 : 13; // px
          const iconAntSrc = `/planets/antiscion/${planet.type}${
            planet.isRetrograde ? "-rx" : ""
          }.png`;

          baseGroup
            .append("image")
            .attr("href", iconAntSrc) // no D3 v6+ use 'href'
            .attr("width", iconAntSize)
            .attr("height", iconAntSize)
            // centraliza o ícone em (xs, ys)
            .attr("x", xAnts - iconAntSize / 2)
            .attr("y", yAnts - iconAntSize / 2);
        }
      });
    }

    if (showOuterchart && showArabicParts && outerArabicParts) {
      arabicPartKeys.forEach((key) => {
        const lot = outerArabicParts[key];

        if (lot !== undefined && lot.planet) {
          const overlappedArabicParts = getOverlappedArabicParts(lot)!;

          let overlapIndex = 0;
          overlappedArabicParts.forEach((overlap, index) => {
            if (overlap.longitudeRaw === lot.longitudeRaw) {
              overlapIndex = index;
            }
          });

          // 1) ângulo zodiacal original (graus → rad)
          const rawDeg = 180 - (lot.longitude % 360) - 90;
          const rawRad = (rawDeg * Math.PI) / 180;

          // 2) compensa a rotação do zodíaco (transforma em ângulo final)
          const rotRad = (zodiacRotation * Math.PI) / 180;
          const angleRad = rawRad - rotRad;

          // 3) offsets de sobreposição
          const idx = overlapIndex;
          // console.log(`index of ${lot.name}: ${idx}`);

          // const symbolOffset = baseSymbolOffset + idx * overlapGap;
          const rSymbol = outerZodiacRadius + symbolOffset;
          const rLineStart = outerZodiacRadius + lineStartOffset;
          const rLineEnd = outerZodiacRadius;

          // 4) cálculos das coordenadas FINAIS
          const xs = rSymbol * Math.cos(angleRad);
          const ys = rSymbol * Math.sin(angleRad);
          const x1 = rLineStart * Math.cos(angleRad);
          const y1 = rLineStart * Math.sin(angleRad);
          const x2 = rLineEnd * Math.cos(angleRad);
          const y2 = rLineEnd * Math.sin(angleRad);

          // 5) desenha a linha
          baseGroup
            .append("line")
            .attr("x1", x1)
            .attr("y1", y1)
            .attr("x2", x2)
            .attr("y2", y2)
            .attr("stroke", "#ff914d") // antiscion color
            .attr("stroke", "black")
            .attr("stroke-width", 1);

          // 6) desenha o ícone do planeta
          const iconSize = 13; // px
          const iconSrc = `/planets/${key}.png`;

          baseGroup
            .append("image")
            .attr("href", iconSrc) // no D3 v6+ use 'href'
            .attr("width", iconSize)
            .attr("height", iconSize)
            // centraliza o ícone em (xs, ys)
            .attr("x", xs - iconSize / 2)
            .attr("y", ys - iconSize / 2);
        }
      });
    }

    if (showOuterchart && showArabicPartsAntiscia && outerArabicParts) {
      arabicPartKeys.forEach((key) => {
        const lot = outerArabicParts[key];
        const baseSymbolOffset = 15;
        const overlapGap = 12.5;

        if (lot !== undefined && lot.planet) {
          const overlappedArabicParts = getOverlappedArabicPartsAntiscion(lot)!;

          let overlapIndex = 0;
          overlappedArabicParts.forEach((overlap, index) => {
            if (overlap.longitudeRaw === lot.longitudeRaw) {
              overlapIndex = index;
            }
          });

          // 1) ângulo zodiacal original (graus → rad)
          const rawDeg = 180 - (lot.antiscion % 360) - 90;
          const rawRad = (rawDeg * Math.PI) / 180;

          // 2) compensa a rotação do zodíaco (transforma em ângulo final)
          const rotRad = (zodiacRotation * Math.PI) / 180;
          const angleRad = rawRad - rotRad;

          // 3) offsets de sobreposição
          const idx = overlapIndex;
          // console.log(`index of ${lot.name}: ${idx}`);

          const symbolOffset = baseSymbolOffset + idx * overlapGap;
          const rSymbol = outerZodiacRadius + symbolOffset;
          const rLineStart = outerZodiacRadius + lineStartOffset;
          const rLineEnd = outerZodiacRadius;

          // 4) cálculos das coordenadas FINAIS
          const xs = rSymbol * Math.cos(angleRad);
          const ys = rSymbol * Math.sin(angleRad);
          const x1 = rLineStart * Math.cos(angleRad);
          const y1 = rLineStart * Math.sin(angleRad);
          const x2 = rLineEnd * Math.cos(angleRad);
          const y2 = rLineEnd * Math.sin(angleRad);

          // 5) desenha a linha
          baseGroup
            .append("line")
            .attr("x1", x1)
            .attr("y1", y1)
            .attr("x2", x2)
            .attr("y2", y2)
            .attr("stroke", "#ff914d") // antiscion color
            .attr("stroke-width", 1);

          // 6) desenha o ícone do planeta
          const iconSize = 13; // px
          const iconSrc = `/planets/antiscion/${key}.png`;

          baseGroup
            .append("image")
            .attr("href", iconSrc) // no D3 v6+ use 'href'
            .attr("width", iconSize)
            .attr("height", iconSize)
            // centraliza o ícone em (xs, ys)
            .attr("x", xs - iconSize / 2)
            .attr("y", ys - iconSize / 2);
        }
      });
    }
  }, [
    planets,
    housesData,
    rotation,
    showArabicParts,
    showPlanetsAntiscia,
    showArabicPartsAntiscia,
  ]);

  const toggleArabicParts = () => {
    setShowArabicParts((prev) => !prev);
  };

  const toggleAntiscia = () => {
    setShowPlanetsAntiscia((prev) => !prev);
  };

  const toggleArabicPartsAntiscia = () => {
    setShowArabicPartsAntiscia((prev) => !prev);
  };

  const containerClasses = showOuterchart ? "mb-20 mt-8" : "mb-10";

  return (
    <div className="w-[38vw] flex flex-col justify-center items-center mt-8">
      {/* <input
        type="number"
        className="border-1 mb-8"
        onChange={(e) => setRotation(Number.parseFloat(e.target.value))}
      /> */}
      <svg className={containerClasses} ref={ref}></svg>

      <div className="flex flex-col gap-2">
        {combineWithBirthChart !== undefined && (
          <button
            className="bg-blue-600 h-8 px-3 text-white rounded hover:bg-blue-700"
            onClick={() => {
              combineWithBirthChart();
            }}
          >
            Combinar com Mapa Natal
          </button>
        )}

        <button
          className="bg-blue-600 h-8 px-3 text-white rounded hover:bg-blue-700"
          onClick={toggleArabicParts}
        >
          Partes Árabes
        </button>
        <button
          className="bg-blue-600 h-8 px-3 text-white rounded hover:bg-blue-700"
          onClick={toggleAntiscia}
        >
          Antiscion Planetas
        </button>
        <button
          className="bg-blue-600 h-8 px-3 text-white rounded hover:bg-blue-700"
          onClick={toggleArabicPartsAntiscia}
        >
          Antiscion Partes Árabes
        </button>
      </div>
    </div>
  );
};

export default AstroChart;
