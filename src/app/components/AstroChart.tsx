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

  // console.log("housesData: ", housesData);

  // const getHouseColor = (index: number): string => {
  //   if (index === 0) {
  //     return "red";
  //   } else if (index % 3 === 0) {
  //     return "black";
  //   } else {
  //     return "gray";
  //   }
  // };

  const getRotationDifference = (asc: number) => {
    const nextSignMultiple = Math.floor(asc / 30) + 1;
    const nextSignLongitude = nextSignMultiple * 30;
    const difference = (nextSignLongitude - asc) * 2;
    return difference;
  };

  // const zodiacRotation =
  //   housesData.ascendant - (30 - getRotationDifference(housesData.ascendant));

  // const zodiacRotation =
  //   housesData.ascendant -
  //   (rotation - getRotationDifference(housesData.ascendant));

  // const zodiacRotation = rotation;

  const zodiacRotation = 270 - housesData.ascendant;

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

    // Círculo externo dos signos
    baseGroup
      .append("circle")
      .attr("r", outerZodiacRadius)
      .attr("fill", "none")
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

    // raio médio do anel onde os números ficarão

    // percorre 0..11 diretamente (já é anti‑horário começando no Ascendente)
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

      centerCircles
        .append("text")
        .attr("x", x)
        .attr("y", y)
        .attr("font-size", 10)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .text((j + 1).toString());
    }

    const innerCircleRadius = smallInnerRadius; // ou o valor que você estiver usando
    // parâmetros de styling
    const houseLineStrokeWidth = (i: number) => (i % 3 === 0 ? 2 : 0.5);

    // mapeamento das siglas das casas angulares
    const angularLabels: Record<number, string> = {
      0: "AC", // Casa 1 – Ascendente
      3: "IC", // Casa 4 – Fundo do Céu
      6: "DC", // Casa 7 – Descendente
      9: "MC", // Casa 10 – Meio do Céu
    };
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

      // só para as casas angulares, adiciona traço e sigla
      if (i % 3 === 0) {
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

    // 1. Defina seu limiar e parâmetros de distância
    const thresholdDeg = 5; // graus para considerar “mesma posição”
    const baseSymbolOffset = 20; // distância base do símbolo até o círculo
    const overlapGap = 5; // gap extra (px) entre símbolos sobrepostos
    const lineStartOffset = 12; // quão “para dentro” a linha começa

    // 2. Agrupe planetas por longitude próxima
    // (cria uma cópia para não mutar o array original)
    const sorted = planets.slice().sort((a, b) => a.longitude - b.longitude);

    const clusters: (typeof sorted)[] = [];
    sorted.forEach((p) => {
      if (clusters.length === 0) {
        clusters.push([p]);
      } else {
        const last = clusters[clusters.length - 1];
        const prev = last[last.length - 1];
        if (Math.abs(p.longitude - prev.longitude) < thresholdDeg) {
          last.push(p);
        } else {
          clusters.push([p]);
        }
      }
    });

    // 3. Mapeie cada planeta ao seu índice dentro do cluster
    const offsetIndex = new Map<(typeof sorted)[number], number>();
    clusters.forEach((cluster) => {
      cluster.forEach((p, i) => {
        offsetIndex.set(p, i);
      });
    });

    // 4. Loop de renderização
    // planets.forEach((planet) => {
    //   // ângulo fixo no zodíaco
    //   const angle = 180 - (planet.longitude % 360) - 90;
    //   const angleRad = (angle * Math.PI) / 180;

    //   // índice de sobreposição (0 = sem sobreposição, 1, 2, …)
    //   const idx = offsetIndex.get(planet) || 0;

    //   // calcula offsets
    //   const symbolOffset = baseSymbolOffset + idx * overlapGap;
    //   const rSymbol = radius - symbolOffset; // onde vai o glifo
    //   const rLineStart = radius - lineStartOffset; // onde começa a linha
    //   const rLineEnd = radius; // onde termina a linha

    //   // coordenadas
    //   const xs = rSymbol * Math.cos(angleRad);
    //   const ys = rSymbol * Math.sin(angleRad);
    //   const x1 = rLineStart * Math.cos(angleRad);
    //   const y1 = rLineStart * Math.sin(angleRad);
    //   const x2 = rLineEnd * Math.cos(angleRad);
    //   const y2 = rLineEnd * Math.sin(angleRad);

    //   // desenha a linha até o círculo
    //   baseGroup
    //     .append("line")
    //     .attr("x1", x1)
    //     .attr("y1", y1)
    //     .attr("x2", x2)
    //     .attr("y2", y2)
    //     .attr("stroke", "black")
    //     .attr("stroke-width", 1)
    //     .attr("transform", `rotate(${-zodiacRotation})`);

    //   // desenha o símbolo do planeta deslocado
    //   baseGroup
    //     .append("text")
    //     .attr("x", xs)
    //     .attr("y", ys)
    //     .attr("font-size", 14)
    //     .attr("text-anchor", "middle")
    //     .attr("alignment-baseline", "middle")
    //     .attr(
    //       "transform",
    //       `rotate(${-zodiacRotation}) rotate(90, ${xs}, ${ys})`
    //     )
    //     .text(getPlanetSymbol(planet.type));
    // });

    planets.forEach((planet) => {
      // 1) ângulo zodiacal original (graus → rad)
      const rawDeg = 180 - (planet.longitude % 360) - 90;
      const rawRad = (rawDeg * Math.PI) / 180;

      // 2) compensa a rotação do zodíaco (transforma em ângulo final)
      const rotRad = (zodiacRotation * Math.PI) / 180;
      const angleRad = rawRad - rotRad;

      // 3) offsets de sobreposição
      const idx = offsetIndex.get(planet) || 0;
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
        .attr("stroke", "black")
        .attr("stroke-width", 1);

      // 6) desenha o símbolo EM PÉ (sem transform extra)
      baseGroup
        .append("text")
        .attr("x", xs)
        .attr("y", ys)
        .attr("font-size", 14)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .text(getPlanetSymbol(planet.type));
    });
  }, [planets, housesData, rotation]);

  return (
    <div className="flex flex-col justify-center items-center">
      <input
        type="number"
        className="border-1 mb-8"
        onChange={(e) => setRotation(Number.parseFloat(e.target.value))}
      />
      <svg ref={ref}></svg>
    </div>
  );
};

export default AstroChart;
