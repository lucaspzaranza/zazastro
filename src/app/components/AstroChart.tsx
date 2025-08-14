"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import {
  angularLabels,
  arabicPartKeys,
  decimalToDegreesMinutes,
  getDegreesInsideASign,
} from "../utils/chartUtils";
import { HousesData, Planet } from "@/interfaces/BirthChartInterfaces";
import { ArabicPart, ArabicPartsType } from "@/interfaces/ArabicPartInterfaces";
import {
  Aspect,
  AspectDataItem,
  AspectedElement,
  AspectType,
  AstroChartProps,
  ChartElement,
  PlanetAspectData,
} from "@/interfaces/AstroChartInterfaces";

const ASPECTS: Aspect[] = [
  { type: "conjunction", angle: 0 },
  { type: "sextile", angle: 60 },
  { type: "square", angle: 90 },
  { type: "trine", angle: 120 },
  { type: "opposition", angle: 180 },
];

const AstroChart: React.FC<AstroChartProps> = ({
  planets,
  housesData,
  arabicParts,
  outerPlanets,
  outerHouses,
  outerArabicParts,
  combineWithBirthChart,
  combineWithReturnChart,
}) => {
  const ref = useRef<SVGSVGElement>(null);
  const [rotation, setRotation] = useState(0);
  const [showArabicParts, setShowArabicParts] = useState(false);
  const [showPlanetsAntiscia, setShowPlanetsAntiscia] = useState(false);
  const [showArabicPartsAntiscia, setShowArabicPartsAntiscia] = useState(false);
  const [showOuterchart, setShowOuterChart] = useState(
    outerPlanets !== undefined && outerHouses !== undefined
  );
  const symbolOffset = 16;

  let chartElements: ChartElement[] = [];
  let chartElementsForAspect: ChartElement[] = [];

  const zodiacRotation = 270 - housesData.ascendant;

  const getElementOffset = (
    element: Planet | ArabicPart,
    isOuterChart: boolean,
    useAntiscion: boolean = false
  ): number => {
    const thresholdDeg = isOuterChart ? 2 : 3.2;
    let offset = 16;

    let nearElements = chartElements.filter((elementToCheck) => {
      // const dist = elementToCheck.longitude - element.longitude;
      const dist =
        elementToCheck.longitude -
        element[useAntiscion ? "antiscion" : "longitude"];
      const wrappedDist = // Segundo condicional caso a distância dê um valor perto de 360
        dist < 0 || dist > 360 - thresholdDeg ? dist - 360 : dist;
      const mod = Math.abs(wrappedDist % 360);
      const distance = mod;
      return distance < thresholdDeg;
    });

    if (nearElements.length > 0) {
      // console.log("nearElements from " + element.name + ":", nearElements);
      const currentElement: ChartElement = {
        id: chartElements.length,
        offset: 0,
        name: element.name,
        longitude: element.longitude,
        isAntiscion: useAntiscion,
        isPlanet: (element as Planet) !== undefined,
        planetType:
          (element as Planet) !== undefined
            ? (element as Planet).type
            : undefined,
      };

      nearElements.push(currentElement);

      nearElements = nearElements.sort((a, b) =>
        Math.abs((a.longitude - b.longitude - 360) % 360)
      );

      const index = nearElements.indexOf(currentElement) + 1;
      offset = index * offset;

      // if (useAntiscion && element.name === "Mercúrio") {
      //   console.log(
      //     "sorted nearElements with " + element.name + ":",
      //     nearElements
      //   );
      //   console.log(`index of ${element.name}: ${index}, offset: ${offset}`);
      // }
    } else {
      // console.log(
      //   `Element ${element.name} has no near elements and his offset will be: ${offset}`
      // );
    }

    return offset;
  };

  const addChartElementAndReturnOffset = (
    element: Planet | ArabicPart,
    isOuterChart: boolean,
    useAntiscion: boolean = false
  ): number => {
    const chartElement: ChartElement = {
      longitude: useAntiscion ? element.antiscionRaw : element.longitude,
      name: element.name,
      id: chartElements.length,
      offset: getElementOffset(element, isOuterChart, useAntiscion),
      isAntiscion: useAntiscion,
      isPlanet: (element as Planet) !== undefined,
      planetType:
        (element as Planet) !== undefined
          ? (element as Planet).type
          : undefined,
    };

    chartElements.push(chartElement);

    return chartElement.offset;
  };

  function resolveOverlapsRowsThenDiagonal(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    opts: {
      iconSize?: number;
      gap?: number;
      keepCount?: number;
      rowSize?: number;
      maxRowsBeforeDiagonal?: number;
      rowInwardStep?: number;
      perpSpacing?: number;
      diagonalPerpStep?: number;
      diagonalInwardStep?: number;
      maxInward?: number;
      scaleFactor?: number;
      scaleCap?: number;
      minRadius?: number;
      maxDeltaDeg?: number;
    } = {}
  ) {
    const {
      iconSize = 13,
      gap = 2,
      keepCount = 2,
      rowSize = 3,
      maxRowsBeforeDiagonal = 2,
      rowInwardStep = 6,
      perpSpacing = iconSize + 2,
      diagonalPerpStep = -1,
      diagonalInwardStep = 2,
      maxInward = 48,
      scaleFactor = 0.5,
      scaleCap = 3,
      minRadius = 8,
      maxDeltaDeg = 18,
    } = opts;

    // 1) coleta imagens já desenhadas (usa centro do ícone)
    const imgs: {
      el: SVGImageElement;
      name: string;
      x: number;
      y: number;
      cx: number;
      cy: number;
      r: number;
      angleRad: number;
    }[] = [];

    svg.selectAll("image").each(function () {
      const el = this as SVGImageElement;
      const sel = d3.select(el);
      const xAttr = sel.attr("x");
      const yAttr = sel.attr("y");
      if (!xAttr || !yAttr) return;
      const x = parseFloat(xAttr);
      const y = parseFloat(yAttr);
      const cx = x + iconSize / 2;
      const cy = y + iconSize / 2;
      const r = Math.hypot(cx, cy);
      const angleRad = Math.atan2(cy, cx);
      const name = sel.attr("data-name") || sel.attr("href") || "";
      imgs.push({ el, name, x, y, cx, cy, r, angleRad });
    });

    if (imgs.length === 0) return;

    // 2) grafo por proximidade (adjacências)
    const separation = iconSize + gap;
    const n = imgs.length;
    const adj: number[][] = Array.from({ length: n }, () => []);
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = imgs[i].cx - imgs[j].cx;
        const dy = imgs[i].cy - imgs[j].cy;
        const dist = Math.hypot(dx, dy);
        if (dist < separation) {
          adj[i].push(j);
          adj[j].push(i);
        }
      }
    }

    // 3) componentes conectadas (clusters) via DFS
    const visited = new Array(n).fill(false);
    const clusters: number[][] = [];
    function dfs(start: number, comp: number[]) {
      const stack = [start];
      visited[start] = true;
      while (stack.length) {
        const v = stack.pop()!;
        comp.push(v);
        for (const w of adj[v]) {
          if (!visited[w]) {
            visited[w] = true;
            stack.push(w);
          }
        }
      }
    }
    for (let i = 0; i < n; i++) {
      if (!visited[i] && adj[i].length > 0) {
        const comp: number[] = [];
        dfs(i, comp);
        if (comp.length > 0) clusters.push(comp);
      }
    }

    // 4) processa cada cluster
    clusters.forEach((comp) => {
      const k = comp.length;
      if (k <= 1) return;

      const clusterScale = Math.min(1 + (k - 2) * scaleFactor, scaleCap);

      // ângulo-base (média vetorial)
      let sumX = 0;
      let sumY = 0;
      comp.forEach((idx) => {
        sumX += Math.cos(imgs[idx].angleRad);
        sumY += Math.sin(imgs[idx].angleRad);
      });
      const baseAngleRad = Math.atan2(sumY, sumX);

      const avgR = Math.max(
        1,
        comp.reduce((acc, idx) => acc + imgs[idx].r, 0) / comp.length
      );

      const deltaRad = Math.min(
        (separation / Math.max(avgR, 1)) * Math.max(1, 1 + (k - 2) * 0.12),
        (maxDeltaDeg * Math.PI) / 180
      );

      const compWithDist = comp.map((idx) => {
        const diff = Math.abs(
          ((imgs[idx].angleRad - baseAngleRad + Math.PI) % (2 * Math.PI)) -
            Math.PI
        );
        return { idx, angDiff: diff };
      });
      compWithDist.sort((a, b) => a.angDiff - b.angDiff);

      const keepIndices = new Set(
        compWithDist
          .slice(0, Math.min(keepCount, compWithDist.length))
          .map((c) => c.idx)
      );
      const keepList = Array.from(keepIndices).sort(
        (a, b) => imgs[a].angleRad - imgs[b].angleRad
      );

      // 4.a) posiciona os keepList (até keepCount) com pequeno spread
      const keepSpreadFactor = 0.6;
      keepList.forEach((idx, i) => {
        const offsetIndex = i - (keepList.length - 1) / 2;
        const ang = baseAngleRad + offsetIndex * deltaRad * keepSpreadFactor;
        const rFinal = Math.max(minRadius, imgs[idx].r);
        const newCenterX = rFinal * Math.cos(ang);
        const newCenterY = rFinal * Math.sin(ang);

        const sel = d3.select(imgs[idx].el as any);
        sel.attr("x", String(newCenterX - iconSize / 2));
        sel.attr("y", String(newCenterY - iconSize / 2));

        const dataName = sel.attr("data-name") || sel.attr("href") || "";
        const cleanName = (dataName || "")
          .replace(/^.*\//, "")
          .replace(/\.(png|svg)$/, "")
          .replace(/-rx$/, "");
        if (cleanName) {
          const line = svg.select<SVGLineElement>(
            `line[data-name="${cleanName}"]`
          );
          if (!line.empty()) {
            line.attr("x2", String(newCenterX));
            line.attr("y2", String(newCenterY));
          }
        }
      });

      // 4.b) os restantes (a partir do 3º) → rows então diagonal
      const rest = compWithDist
        .slice(Math.min(keepCount, compWithDist.length))
        .map((c) => c.idx);
      rest.sort((a, b) => imgs[a].angleRad - imgs[b].angleRad);

      // NÃO escalamos perpSpacing; apenas rows usam perpSpacing como comprimento de arco desejado
      const effectivePerpSpacing = perpSpacing;
      const effectiveRowInwardStep = rowInwardStep * clusterScale;
      const maxRowCapacity = rowSize * maxRowsBeforeDiagonal;

      rest.forEach((idx, restIndex) => {
        const img = imgs[idx];
        const ang = img.angleRad;

        const radialX = Math.cos(ang);
        const radialY = Math.sin(ang);
        const perpX = -Math.sin(ang);
        const perpY = Math.cos(ang);

        if (restIndex < maxRowCapacity) {
          const rowIndex = Math.floor(restIndex / rowSize);
          const posInRow = restIndex % rowSize;
          const centerOffsetIndex = posInRow - (rowSize - 1) / 2;

          // inward para a fila atual
          const inwardAmount = Math.min(
            maxInward,
            effectiveRowInwardStep * (rowIndex + 1)
          );
          let rFinal = Math.max(minRadius, img.r - inwardAmount);
          if (rFinal < 1) rFinal = 1;

          // Agora o truque: usamos deslocamento ANGULAR tal que arco ≈ perpSpacing * centerOffsetIndex
          // Δθ = s / rFinal  (s = perpSpacing * centerOffsetIndex)
          const s = effectivePerpSpacing * centerOffsetIndex; // pode ser negativo para a esquerda
          const angularOffset = s / rFinal; // radianos
          const newAngle = ang + angularOffset;

          const newCenterX = rFinal * Math.cos(newAngle);
          const newCenterY = rFinal * Math.sin(newAngle);

          const sel = d3.select(img.el as any);
          sel.attr("x", String(newCenterX - iconSize / 2));
          sel.attr("y", String(newCenterY - iconSize / 2));

          const dataName = sel.attr("data-name") || sel.attr("href") || "";
          const cleanName = (dataName || "")
            .replace(/^.*\//, "")
            .replace(/\.(png|svg)$/, "")
            .replace(/-rx$/, "");
          if (cleanName) {
            const line = svg.select<SVGLineElement>(
              `line[data-name="${cleanName}"]`
            );
            if (!line.empty()) {
              line.attr("x2", String(newCenterX));
              line.attr("y2", String(newCenterY));
            }
          }
        } else {
          // beyond row capacity -> diagonal fallback
          const extraIndex = restIndex - maxRowCapacity;
          const perpSign = -Math.sign(Math.sin(ang)) || 1;
          const stepMultiplier = extraIndex + 1;

          const perpOffset =
            diagonalPerpStep * clusterScale * stepMultiplier * perpSign;
          const inwardAmount = Math.min(
            maxInward,
            diagonalInwardStep * clusterScale * stepMultiplier
          );
          const rFinal = Math.max(minRadius, img.r - inwardAmount);

          const newCenterX = rFinal * radialX + perpOffset * perpX;
          const newCenterY = rFinal * radialY + perpOffset * perpY;

          const sel = d3.select(img.el as any);
          sel.attr("x", String(newCenterX - iconSize / 2));
          sel.attr("y", String(newCenterY - iconSize / 2));

          const dataName = sel.attr("data-name") || sel.attr("href") || "";
          const cleanName = (dataName || "")
            .replace(/^.*\//, "")
            .replace(/\.(png|svg)$/, "")
            .replace(/-rx$/, "");
          if (cleanName) {
            const line = svg.select<SVGLineElement>(
              `line[data-name="${cleanName}"]`
            );
            if (!line.empty()) {
              line.attr("x2", String(newCenterX));
              line.attr("y2", String(newCenterY));
            }
          }
        }
      });
    });
  }

  const mod360 = (n: number) => ((n % 360) + 360) % 360; // garante 0..359.999

  function isAspectableElement(element: ChartElement): boolean {
    const isPlanet = element.planetType !== undefined;
    if (isPlanet) {
      const isAspectablePlanet =
        element.planetType !== "uranus" &&
        element.planetType !== "neptune" &&
        element.planetType !== "pluto" &&
        element.planetType !== "northNode" &&
        element.planetType !== "southNode";
      return isAspectablePlanet;
    }

    return true;
  }

  function aspectCanBeUsed(element: ChartElement, aspect: Aspect): boolean {
    const isArabicPart = element.planetType === undefined;

    if (isArabicPart) {
      return aspect.type === "conjunction" || aspect.type === "opposition";
    } else {
      if (element.isAntiscion)
        return aspect.type === "conjunction" || aspect.type === "opposition";
    }

    return true;
  }

  function generateAspectKey(
    element: ChartElement,
    aspectedElement: ChartElement,
    aspect: Aspect
  ): string {
    return `${element.planetType ?? element.name}-${aspect.type}-${
      aspectedElement.planetType ?? aspectedElement.name
    }`;
  }

  function aspectAlreadyRegistered(
    data: PlanetAspectData[],
    element: ChartElement,
    aspectedElement: ChartElement,
    aspect: Aspect
  ): boolean {
    const invertedKey = generateAspectKey(aspectedElement, element, aspect);

    const foundAspect = data.find((asp) => asp.key === invertedKey);
    return foundAspect !== undefined;
  }

  function getAspectOrb(
    element: ChartElement,
    aspectedElement: ChartElement
  ): number {
    if (!element.isPlanet || !aspectedElement.isPlanet)
      // some of them is arabic part, so the orb will be only 1 degree
      return 1;

    return 3; // default orb for planets
  }

  function getAspects(elements: ChartElement[]): PlanetAspectData[] {
    const aspectsData: PlanetAspectData[] = [];
    const aspectableElements = elements.filter((el) => isAspectableElement(el));

    aspectableElements.forEach((element, index) => {
      ASPECTS.forEach((aspect) => {
        if (aspectCanBeUsed(element, aspect)) {
          const elementsWithAspect = aspectableElements.filter((elToCheck) => {
            if (elToCheck !== element && aspectCanBeUsed(elToCheck, aspect)) {
              const orb = getAspectOrb(element, elToCheck); // 3 Para planetas, 1 para partes árabes
              const valToCheck = mod360(element.longitude + aspect.angle);
              const lowerLimit = mod360(elToCheck.longitude - orb);
              const upperLimit = mod360(elToCheck.longitude + orb);
              return valToCheck >= lowerLimit && valToCheck <= upperLimit;
            }
          });

          if (elementsWithAspect.length > 0) {
            elementsWithAspect.forEach((elWithAsp) => {
              if (
                !aspectAlreadyRegistered(
                  aspectsData,
                  element,
                  elWithAsp,
                  aspect
                )
              ) {
                aspectsData.push({
                  aspectType: aspect.type,
                  element: {
                    name: element.planetType ?? element.name,
                    longitude: element.longitude,
                    isPlanet: element.planetType !== undefined,
                  },
                  aspectedElement: {
                    name: elWithAsp.planetType ?? elWithAsp.name,
                    longitude: elWithAsp.longitude,
                    isPlanet: element.planetType !== undefined,
                  },
                  key: generateAspectKey(element, elWithAsp, aspect),
                });
              }
            });
          }
        }
      });
    });

    return aspectsData;
  }

  function drawAspectElementTrace(options: {
    baseGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
    element: AspectedElement;
    radius: number;
    lineStartOffset: number;
  }) {
    // 1) ângulo zodiacal original (graus → rad)
    const rawDeg = 180 - (options.element.longitude % 360) - 90;
    const rawRad = (rawDeg * Math.PI) / 180;

    // 2) compensa a rotação do zodíaco (transforma em ângulo final)
    const rotRad = (zodiacRotation * Math.PI) / 180;
    const angleRad = rawRad - rotRad;

    // 3) offsets de sobreposição
    const rSymbol = options.radius - symbolOffset;
    const rLineStart = options.radius - options.lineStartOffset;
    const rLineEnd = options.radius;

    // 4) cálculos das coordenadas FINAIS
    const xs = rSymbol * Math.cos(angleRad);
    const ys = rSymbol * Math.sin(angleRad);

    const x1 = rLineStart * Math.cos(angleRad);
    const y1 = rLineStart * Math.sin(angleRad);
    const x2 = rLineEnd * Math.cos(angleRad);
    const y2 = rLineEnd * Math.sin(angleRad);

    // 5) desenha a linha
    options.baseGroup
      .attr("data-name", options.element.name)
      .append("line")
      .attr("x1", x1)
      .attr("y1", y1)
      .attr("x2", x2)
      .attr("y2", y2)
      .attr("stroke", "black")
      .attr("stroke-width", 1);
  }

  function getAspectColor(aspect: PlanetAspectData): string {
    if (
      aspect.aspectType === "conjunction" ||
      aspect.aspectType === "square" ||
      aspect.aspectType === "opposition"
    ) {
      return "red";
    }

    // Sextil e trígono
    return "blue";
  }

  function getAspectStrokeWidth(aspect: PlanetAspectData): number {
    if (aspect.aspectType === "conjunction") return 6;

    const angle = ASPECTS.find((asp) => asp.type === aspect.aspectType)?.angle;
    let diff = 0;
    let width = 1;

    if (angle) {
      const angle = getDegreesInsideASign(aspect.element.longitude);
      const aspectedAngle = getDegreesInsideASign(
        aspect.aspectedElement.longitude
      );
      diff = decimalToDegreesMinutes(Math.abs(aspectedAngle - angle));
      // console.log(
      //   `Aspecto ${aspect.key}, com ${aspect.element.name}: ${angle} e
      // ${aspect.aspectedElement.name}: ${aspectedAngle} com diff de ${diff}`
      // );

      if (diff <= 0.3) {
        // The perfect aspect
        width = 2;
      } else if (diff > 0.3 && diff <= 1.3) {
        // The mid-high width aspect
        width = 1.5;
      } else if (diff > 1.3 && diff <= 2.3) {
        // The mid-lower aspect
        width = 1.25;
      }
    }

    // console.log(
    //   `Aspecto ${aspect.key} com dif = ${diff}, com espessura ${width}`
    // );
    return width; // default
  }

  function drawAspectStroke(options: {
    baseGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
    aspect: PlanetAspectData;
    radius: number;
    lineStartOffset: number;
  }) {
    const { aspect, radius, lineStartOffset, baseGroup } = { ...options };

    // 1) ângulo zodiacal original (graus → rad)
    const startRawDeg = 180 - mod360(aspect.element.longitude) - 90;
    const startRawRad = (startRawDeg * Math.PI) / 180;

    const endRawDeg = 180 - mod360(aspect.aspectedElement.longitude) - 90;
    const endRawRad = (endRawDeg * Math.PI) / 180;

    // 2) compensa a rotação do zodíaco (transforma em ângulo final)
    const startRodRad = (zodiacRotation * Math.PI) / 180;
    const startAngleRad = startRawRad - startRodRad;

    const endRodRad = (zodiacRotation * Math.PI) / 180;
    const endAngleRad = endRawRad - endRodRad;

    // 3) offsets de sobreposição — ambos positivos (corrige inversão de 180°)
    const rLineStart = radius - lineStartOffset;
    const rLineEnd = radius - lineStartOffset;

    const x1 = rLineStart * Math.cos(startAngleRad);
    const y1 = rLineStart * Math.sin(startAngleRad);
    const x2 = rLineEnd * Math.cos(endAngleRad);
    const y2 = rLineEnd * Math.sin(endAngleRad);

    // ângulo da linha (opcional, útil se for rotacionar um grupo)
    const angleLineRad = Math.atan2(y2 - y1, x2 - x1);
    const angleLineDeg = (angleLineRad * 180) / Math.PI;

    // 5) desenha a linha
    baseGroup
      .attr("data-name", aspect.element.name)
      .append("line")
      .attr("x1", x1)
      .attr("y1", y1)
      .attr("x2", x2)
      .attr("y2", y2)
      .attr("stroke", getAspectColor(aspect))
      .attr("stroke-width", getAspectStrokeWidth(aspect));

    // se quiser ver o ângulo no console pra debug:
    // console.log('aspect', aspect.element.name, 'angleDeg', angleLineDeg);
  }

  function drawAspects(
    elements: ChartElement[],
    options: {
      baseGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
      radius: number;
      lineStartOffset: number;
    }
  ) {
    const aspectsData = getAspects(elements);
    // console.log(aspectsData);

    aspectsData.forEach((aspect) => {
      drawAspectElementTrace({
        ...options,
        element: aspect.element,
      });

      drawAspectElementTrace({
        ...options,
        element: aspect.aspectedElement,
      });

      drawAspectStroke({
        ...options,
        lineStartOffset:
          aspect.aspectType === "conjunction" ? 3 : options.lineStartOffset,
        aspect,
      });
    });
  }

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
    const outerChartBorderRadius = outerZodiacRadius + 60;

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

    // Desenha cada cúspide das casas
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
    chartElements = [];
    chartElementsForAspect = [];
    planets.forEach((planet) => {
      // 1) ângulo zodiacal original (graus → rad)
      const rawDeg = 180 - (planet.longitude % 360) - 90;
      const rawRad = (rawDeg * Math.PI) / 180;

      // 2) compensa a rotação do zodíaco (transforma em ângulo final)
      const rotRad = (zodiacRotation * Math.PI) / 180;
      const angleRad = rawRad - rotRad;

      // 3) offsets de sobreposição
      // const symbolOffset = addChartElementAndReturnOffset(planet, false);
      // const symbolOffset = 16;
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
      const iconSize = 13; // px

      // 5) desenha a linha
      baseGroup
        .attr("data-name", planet.type)
        .append("line")
        .attr("x1", x1)
        .attr("y1", y1)
        .attr("x2", x2)
        .attr("y2", y2)
        .attr("stroke", "black")
        .attr("stroke-width", 1);

      // 6) desenha o ícone do planeta
      const iconSrc = `/planets/${planet.type}${
        planet.isRetrograde ? "-rx" : ""
      }.png`;

      baseGroup
        .attr("data-name", planet.type)
        .append("image")
        .attr("href", iconSrc) // no D3 v6+ use 'href'
        .attr("width", iconSize)
        .attr("height", iconSize)
        .attr("x", xs - iconSize / 2)
        .attr("y", ys - iconSize / 2);

      chartElementsForAspect.push({
        id: chartElementsForAspect.length,
        isAntiscion: false,
        longitude: planet.longitude,
        name: planet.name,
        offset: 0,
        isPlanet: true,
        planetType: planet.type,
      });

      if (showPlanetsAntiscia) {
        // 1) ângulo zodiacal original (graus → rad)
        const rawAntDeg = 180 - (planet.antiscion % 360) - 90;
        const rawAntRad = (rawAntDeg * Math.PI) / 180;

        // 2) compensa a rotação do zodíaco (transforma em ângulo final)
        const rotAntRad = (zodiacRotation * Math.PI) / 180;
        const angleAntRad = rawAntRad - rotAntRad;

        // 3) offsets de sobreposição
        // const symbolAntOffset = addChartElementAndReturnOffset(
        //   planet,
        //   false,
        //   true
        // );
        // const symbolAntOffset = 16;
        // const rAntSymbol = radius - symbolAntOffset;
        const rAntSymbol = radius - symbolOffset;
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

        chartElementsForAspect.push({
          id: chartElementsForAspect.length,
          isAntiscion: true,
          longitude: planet.antiscion,
          name: planet.name + " (Antiscion)",
          offset: 0,
          isPlanet: true,
          planetType: planet.type,
        });
      }
    });

    if (showArabicParts && arabicParts !== undefined) {
      arabicPartKeys.forEach((key) => {
        const lot = arabicParts[key];

        if (lot !== undefined && lot.planet) {
          // 1) ângulo zodiacal original (graus → rad)
          const rawDeg = 180 - (lot.longitude % 360) - 90;
          const rawRad = (rawDeg * Math.PI) / 180;

          // 2) compensa a rotação do zodíaco (transforma em ângulo final)
          const rotRad = (zodiacRotation * Math.PI) / 180;
          const angleRad = rawRad - rotRad;

          // 3) offsets de sobreposição
          // const symbolOffset = addChartElementAndReturnOffset(
          //   lot,
          //   false,
          //   false
          // );
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

          chartElementsForAspect.push({
            id: chartElementsForAspect.length,
            isAntiscion: false,
            longitude: lot.longitude,
            name: lot.partKey,
            offset: 0,
            isPlanet: false,
          });
        }
      });
    }

    if (showArabicPartsAntiscia && arabicParts !== undefined) {
      arabicPartKeys.forEach((key) => {
        const lot = arabicParts[key];

        if (lot !== undefined && lot.planet) {
          // 1) ângulo zodiacal original (graus → rad)
          const rawDeg = 180 - (lot.antiscion % 360) - 90;
          const rawRad = (rawDeg * Math.PI) / 180;

          // 2) compensa a rotação do zodíaco (transforma em ângulo final)
          const rotRad = (zodiacRotation * Math.PI) / 180;
          const angleRad = rawRad - rotRad;

          // 3) offsets de sobreposição
          // const symbolOffset = addChartElementAndReturnOffset(lot, false, true);
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

          chartElementsForAspect.push({
            id: chartElementsForAspect.length,
            isAntiscion: true,
            longitude: lot.antiscion,
            name: lot.partKey + " (Antiscion)",
            offset: 0,
            isPlanet: false,
          });
        }
      });
    }

    if (showOuterchart && outerHouses) {
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

    if (showOuterchart && outerPlanets) {
      chartElements = [];
      outerPlanets.forEach((planet) => {
        // 1) ângulo zodiacal original (graus → rad)
        const rawDeg = 180 - (planet.longitude % 360) - 90;
        const rawRad = (rawDeg * Math.PI) / 180;

        // 2) compensa a rotação do zodíaco (transforma em ângulo final)
        const rotRad = (zodiacRotation * Math.PI) / 180;
        const angleRad = rawRad - rotRad;

        // 3) offsets de sobreposição
        const outerPlanetSymbolOffset = addChartElementAndReturnOffset(
          planet,
          true
        );
        const rSymbol = outerZodiacRadius + outerPlanetSymbolOffset;
        // const rSymbol = outerZodiacRadius + symbolOffset;
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
          const symbolAntOffset = addChartElementAndReturnOffset(
            planet,
            true,
            true
          );
          const rAntSymbol = outerZodiacRadius + symbolAntOffset;
          // const rAntSymbol = outerZodiacRadius + symbolOffset;
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
            .attr("x", xAnts - iconAntSize / 2)
            .attr("y", yAnts - iconAntSize / 2);
        }
      });
    }

    if (showOuterchart && showArabicParts && outerArabicParts) {
      arabicPartKeys.forEach((key) => {
        const lot = outerArabicParts[key];

        if (lot !== undefined && lot.planet) {
          // 1) ângulo zodiacal original (graus → rad)
          const rawDeg = 180 - (lot.longitude % 360) - 90;
          const rawRad = (rawDeg * Math.PI) / 180;

          // 2) compensa a rotação do zodíaco (transforma em ângulo final)
          const rotRad = (zodiacRotation * Math.PI) / 180;
          const angleRad = rawRad - rotRad;

          // 3) offsets de sobreposição
          const outerLotSymbolOffset = addChartElementAndReturnOffset(
            lot,
            true
          );
          const rSymbol = outerZodiacRadius + outerLotSymbolOffset;
          // const rSymbol = outerZodiacRadius + symbolOffset;
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
        if (lot !== undefined && lot.planet) {
          // 1) ângulo zodiacal original (graus → rad)
          const rawDeg = 180 - (lot.antiscion % 360) - 90;
          const rawRad = (rawDeg * Math.PI) / 180;

          // 2) compensa a rotação do zodíaco (transforma em ângulo final)
          const rotRad = (zodiacRotation * Math.PI) / 180;
          const angleRad = rawRad - rotRad;

          // 3) offsets de sobreposição
          const lotAntiscionSymbolOffset = addChartElementAndReturnOffset(
            lot,
            true,
            true
          );
          const rSymbol = outerZodiacRadius + lotAntiscionSymbolOffset;
          // const rSymbol = outerZodiacRadius + symbolOffset;
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

    resolveOverlapsRowsThenDiagonal(svg, {
      iconSize: 13,
      gap: !showArabicParts ? 4 : 0,
      rowSize: 3,
      maxRowsBeforeDiagonal: 2,
      rowInwardStep: 5,
      perpSpacing: 10,
      diagonalPerpStep: -1,
      diagonalInwardStep: 2,
    });

    drawAspects(chartElementsForAspect, {
      baseGroup,
      radius: smallInnerRadius,
      lineStartOffset,
    });
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
    <div className="w-[38vw] flex flex-col justify-center items-center mt-8 mx-10">
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

        {combineWithReturnChart !== undefined && (
          <button
            className="bg-blue-600 h-8 px-3 text-white rounded hover:bg-blue-700"
            onClick={() => {
              combineWithReturnChart();
            }}
          >
            Combinar com Mapa Do Retorno Solar
          </button>
        )}

        <button
          className="bg-blue-600 h-8 px-3 text-white rounded hover:bg-blue-700"
          onClick={toggleAntiscia}
        >
          Antiscion Planetas
        </button>

        <button
          className="bg-blue-600 h-8 px-3 text-white rounded hover:bg-blue-700"
          onClick={toggleArabicParts}
        >
          Partes Árabes
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
