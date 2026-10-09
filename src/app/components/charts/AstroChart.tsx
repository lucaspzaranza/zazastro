"use client";

import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import * as d3 from "d3";
import {
  angularLabels,
  arabicPartKeys,
  decimalToDegreesMinutes,
  fixedNames,
  formatSignColor,
  getArabicPartImage,
  getDegreeAndSign,
  getDegreesInsideASign,
  getPlanetImage,
  getPlanetImagePath,
  getSign,
  mod360,
  signsGlpyphs,
} from "@/utils/chartUtils";
import { FixedStar, PlanetType, Sign, TermOrDecan } from "@/interfaces/BirthChartInterfaces";
import {
  Aspect,
  AspectedElement,
  AstroChartProps,
  ChartElement,
  ElementOverlapLongitudeAndOffset,
  OrbCalculationOrientation,
  PlanetAspectData,
} from "@/interfaces/AstroChartInterfaces";
import { SymbolLayout } from "@/utils/symbolLayout";
import { useScreenDimensions } from "@/contexts/ScreenDimensionsContext";
import ReturnSelectorArrows from "../ReturnSelectorArrows";
import { useChartMenu } from "@/contexts/ChartMenuContext";
import { useBirthChart } from "@/contexts/BirthChartContext";
import { useTranslations } from "next-intl";
import { ArabicPart } from "@/interfaces/ArabicPartInterfaces";
import { useAspectsData } from "@/contexts/AspectsContext";
import { CHALDEAN_DECANS } from "@/app/utils/termsAndDecans";
import ChartHeaderSubtitle from "../ChartHeaderSubtitle";
import { useArabicParts } from "@/contexts/ArabicPartsContext";
import { useProfiles } from "@/contexts/ProfilesContext";
import { useAstroChartSettings } from "@/hooks/useAstroChartSettings";

const PLANET_DIM_FILTER_ID = "astro-chart-grayscale";

interface IsolatablePlanet {
  xs: number;
  ys: number;
  iconSize: number;
  iconSrc: string;
  content: React.ReactNode;
  tick?: { x1: number; y1: number; x2: number; y2: number; stroke?: string };
}

interface TooltipData {
  x: number; // horizontal anchor center, in container coordinates
  content: React.ReactNode;
  // Vertical edges of the anchor (planet/element/pointer), in container coordinates.
  // The tooltip goes below `bottomY`.
  anchor: { bottomY: number; topY: number };
}

const SMALL_TARGET_MAX_PX = 48; // elements up to this size anchor the tooltip to themselves
const MOUSE_POINTER_GAP = 16; // px below the cursor for large targets
const TOUCH_POINTER_GAP = 28; // px below the finger for large targets

const PLANET_HIGHLIGHT_RADIUS_FACTOR = 0.85; // circle radius = iconSize * factor
const PLANET_HIGHLIGHT_SCALE = 1.2;
const TOOLTIP_GAP = 6; // px between the planet circle and the tooltip
const TOOLTIP_VIEWPORT_MARGIN = 8; // px

const ASPECTS: Aspect[] = [
  { type: "conjunction", angle: 0 },
  { type: "sextile", angle: 60 },
  { type: "square", angle: 90 },
  { type: "trine", angle: 120 },
  { type: "opposition", angle: 180 },
];

const TRANS_SATURNIAN_TYPES: PlanetType[] = ["uranus", "neptune", "pluto"];

/**
 * Toggles de exibição que antes viviam como useState internos ao
 * AstroChart e agora são controlados de fora (ChartAndData.tsx via
 * useAstroChartToggles), para poderem ser compartilhados com o
 * cabeçalho/menu que ficou fora deste componente.
 */
interface AstroChartToggleProps {
  isZoomed?: boolean;
  showArabicParts: boolean;
  showPlanetsAntiscia: boolean;
  showArabicPartsAntiscia: boolean;
  showDegrees: boolean;
  useTerms: boolean;
  useDecans: boolean;
  showFixedStars: boolean;
  showTransSaturnians: boolean;
  currentTerms: Record<Sign, TermOrDecan[]> | undefined;
}

const AstroChart: React.FC<AstroChartProps & { props: AstroChartProps["props"] & AstroChartToggleProps }> = ({ props }) => {
  const {
    planets,
    housesData,
    arabicParts,
    outerPlanets,
    outerHouses,
    outerArabicParts,
    fixedStars,
    useReturnSelectorArrows,
    onUpdateAspectsData,
    showArabicParts,
    showPlanetsAntiscia,
    showArabicPartsAntiscia,
    showTransSaturnians,
    showDegrees,
    useTerms,
    useDecans,
    showFixedStars,
    currentTerms,
    dateBlocks,
    isZoomed = false,
  } = { ...props };

  const ref = useRef<SVGSVGElement>(null);

  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const tooltipRef = useRef<TooltipData | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const aspectStrokeCoords = useRef<Map<string, { x1: number; y1: number; x2: number; y2: number }>>(new Map());

  const { isMobileBreakPoint } = useScreenDimensions();
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const { chartMenu, isReturnChart, isLunarDerivedReturnChart, isSinastryChart, 
    isProgressionChart, isProfectionChart, isTransitsChart, isMomentChart } = useChartMenu();
  const { birthChart, isMountingChart, updateIsMountingChart, 
    isCombinedWithBirthChart, isCombinedWithReturnChart } = useBirthChart();
  const { customArabicPart } = useArabicParts();
  const { currentProfile } = useProfiles();
  const { settings } = useAstroChartSettings();
  const { showEssentialFixedStars, showSecondaryFixedStars } = settings;

  useEffect(() => {
    const updateViewportSize = () => setViewportSize({ width: window.innerWidth, height: window.innerHeight });
    updateViewportSize();
    window.addEventListener("resize", updateViewportSize);
    return () => window.removeEventListener("resize", updateViewportSize);
  }, []);

  const [testValue] = useState(2.5);
  const [showOuterChart, setShowOuterChart] = 
    useState(outerPlanets !== undefined && outerHouses !== undefined);
  const [showAdvanceOptions, setShowAdvanceOptions] = useState(false);

  const { aspects, updateAspectsData, selectedAspect, setSelectedAspect, 
    hasIsolatedAspect, setHasIsolatedAspect } = useAspectsData();

  const getScaleFactor = (): number => {
    if(!isMobileBreakPoint()) {

      if(birthChart?.transits)
        return 1.45;

      return showOuterChart ? 1.25 : 1.5;
    } else { 

      if(birthChart?.transits)
        return 0.7;

      if((useDecans && !useTerms) || (!useDecans && useTerms))
        return showOuterChart? 0.625 : 0.8;
      if(!useDecans && !useTerms)
        return showOuterChart? 0.625 : 0.86;
      if(useDecans && useTerms)
        return showOuterChart? 0.625 : 0.75;

      return showOuterChart ? 0.625 : 0.85;
    }
  }

  // const [selectedAspect, setSelectedAspect] = useState<PlanetAspectData | null>(null);
  // const selectedAspectRef = useRef<PlanetAspectData | null>(null);
  // const [hasIsolatedAspect, setHasIsolatedAspect] = useState(false);
  
  const t = useTranslations();
  const outerInitial = t("aspects.outerInitial");

  const [fixedStarsAspects, setFixedStarAspects] = useState<PlanetAspectData[]>(
    []
  );
  const symbolOffset = 16;
  const lineStartOffset = 6; // quão “para dentro” a linha de um aspecto começa

  const chartElementsForAspect = useRef<ChartElement[]>([]);
  const symbolLayoutRef = useRef<SymbolLayout | null>(null);

  const isMobile = isMobileBreakPoint();
  const size = !isMobile ? 400 : 370;
  // const scaleFactor = !isMobileBreakPoint()
  //   ? showOuterChart
  //     ? 1.25
  //     : 1.5
  //   : showOuterChart
  //     ? 0.7
  //     : 0.85;
  const zoomScaleFactor = viewportSize.width && viewportSize.height
    ? Math.min(getScaleFactor() * 1.5, Math.min(viewportSize.width, viewportSize.height) * 0.93 / 544)
    : getScaleFactor();
  const scaleFactor = isZoomed ? zoomScaleFactor : getScaleFactor();
  const scaledSize = size * scaleFactor;
  const center = size / 2;

  /**
   * Espessura de cada anel de dignidade (Faces/Termos). Ambos têm o mesmo
   * tamanho hoje; ajuste aqui se quiser anéis com espessuras diferentes.
   */
  const dignityRingThickness = 11;

  /**
   * Espaço total reservado para os anéis ativos. O radius cresce dinamicamente
   * conforme useDecans/useTerms são ativados, abrindo espaço para dentro
   * (na faixa imediatamente interna à borda do círculo zodiacal) sem afetar
   * nada que hoje já depende de radius "para fora" (zodiacRadius, glifos, etc).
   */
  const activeDignityRingsCount = (useDecans ? 1 : 0) + (useTerms && currentTerms !== undefined ? 1 : 0);
  const dignityRingsSpace = activeDignityRingsCount * dignityRingThickness;

  const baseRadius = size / 2 - 40;
  const radius = baseRadius + dignityRingsSpace;
  const zodiacRadius = radius + 20;
  const outerZodiacRadius = zodiacRadius + 10;
  const outerChartBorderRadius = outerZodiacRadius + 60;
  const outerChartBorderRadiusTransits = outerZodiacRadius + 32.5;
  const transitsIconsOffset = 18;

  /**
   * Anéis de Faces (decanatos) e Termos, desenhados por dentro da borda do
   * círculo zodiacal (radius), comprimindo a área de planetas/casas para abrir
   * espaço. Faces ficam coladas à borda interna do círculo (mais próximas dos
   * glifos, do lado de fora), Termos ficam um anel mais para dentro.
   * Ícones bem pequenos, no estilo Astrodienst/Astro-Seek.
   */
  const decansRingOuter = radius;
  const decansRingInner = useDecans ? decansRingOuter - dignityRingThickness : decansRingOuter;
  const termsDivisionRadius = decansRingInner; // circunferência divisória entre Faces e Termos
  const termsRingOuter = termsDivisionRadius;
  const termsRingInner = (useTerms && currentTerms !== undefined) ? termsRingOuter - dignityRingThickness : termsRingOuter;
  const dignityIconSize = 7; // px, ícone do planeta regente dentro dos anéis

  /**
   * Borda mais interna entre os anéis de dignidade ativos (ou o próprio `radius`,
   * se nenhum estiver ativo). Tudo que é desenhado "para dentro" do círculo
   * zodiacal — planetas, cúspides de casa, números de casa, aspectos — deve
   * partir DESTE raio, não de `radius`, para não ficar sobreposto aos anéis
   * de Termos/Faces quando eles estiverem ativos.
   */
  const chartInnerRadius = termsRingInner;

  // Ordem dos signos batendo com o índice usado em zodiacSigns (0 = Aries ... 11 = Pisces)
  const SIGN_ORDER: Sign[] = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
  ];

  const baseGroupRef =
    useRef<d3.Selection<SVGGElement, unknown, null, undefined>>(undefined);

  const iconSize = 13; // px

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

  const getHouseDataAscendant = () => housesData?.ascendant ?? 0;

  const zodiacRotation = 270 - getHouseDataAscendant();

  const zodiacRotationRef = useRef(zodiacRotation);
  const radiusRef = useRef(radius);
  const lineStartOffsetRef = useRef(lineStartOffset);

  function showTooltip(event: MouseEvent, content: React.ReactNode) {
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const target = event.currentTarget as Element | null;
    const targetRect = target?.getBoundingClientRect();

    const isSmallTarget =
      !!targetRect &&
      targetRect.width <= SMALL_TARGET_MAX_PX &&
      targetRect.height <= SMALL_TARGET_MAX_PX;

    if (targetRect && isSmallTarget) {
      // Planets, stars, glyphs: anchored to the element itself
      setTooltip({
        content,
        x: targetRect.left + targetRect.width / 2 - containerRect.left,
        anchor: {
          topY: targetRect.top - containerRect.top - TOOLTIP_GAP,
          bottomY: targetRect.bottom - containerRect.top + TOOLTIP_GAP,
        },
      });
      return;
    }

    // Large targets (house arcs, aspect lines): anchored to the pointer
    const gap = isMobileBreakPoint() ? TOUCH_POINTER_GAP : MOUSE_POINTER_GAP;
    const pointerX = event.clientX - containerRect.left;
    const pointerY = event.clientY - containerRect.top;
    setTooltip({
      content,
      x: pointerX,
      anchor: { topY: pointerY - gap, bottomY: pointerY + gap },
    });
  }

  function showTooltipBelowPlanet(hitNode: SVGGraphicsElement, planet: IsolatablePlanet) {
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const hitRect = hitNode.getBoundingClientRect();

    // The hit rect is centered on the planet and is not affected by the highlight
    // scale transition, so it is a stable reference point
    const centerX = hitRect.left + hitRect.width / 2 - containerRect.left;
    const centerY = hitRect.top + hitRect.height / 2 - containerRect.top;

    // Final on-screen radius of the highlight circle (svg units * baseGroup scale)
    const radiusPx =
      planet.iconSize * PLANET_HIGHLIGHT_RADIUS_FACTOR * PLANET_HIGHLIGHT_SCALE * scaleFactor;

    setTooltip({
      x: centerX,
      content: planet.content,
      anchor: {
        bottomY: centerY + radiusPx + TOOLTIP_GAP,
        topY: centerY - radiusPx - TOOLTIP_GAP,
      },
    });
  }

  function makePlanetTooltip(
    options: {
    label: string,
    longitude: number,
    planetType?: PlanetType,
    isAntiscion?: boolean,
    isRetrograde?: boolean,
    isTransit?: boolean,}
  ): React.ReactNode {
    const { label, longitude, planetType, isAntiscion, isRetrograde, isTransit } = options;
    const degree = getDegreeAndSign(longitude, true);

    return (
      <div className="flex flex-row items-center gap-1">
        {planetType && getPlanetImage(planetType, {
          isAntiscion,
          isRetrograde,
          isTransit,
          longitude,
          size: 15,
        })}
        <span>{label}: {formatSignColor(degree)}</span>
      </div>
    );
  }

  function makeHouseTooltip(houseIndex: number, longitude: number): React.ReactNode {
    const degree = getDegreeAndSign(longitude, true);
    return (
      <div className="flex items-center gap-1">
        <span>Casa {houseIndex + 1}: </span>
        {formatSignColor(degree)}
      </div>
    );
  }

  function makeArabicPartTooltip(
    lot: ArabicPart,
    options: {
      isAntiscion: boolean,
      isOuterChart?: boolean
    } = {
      isAntiscion: false,
      isOuterChart: false
    }
  ): React.ReactNode {
    const label = `${t(`arabicParts.${lot.partKey}.short`)}${options.isOuterChart ? ` (${t("aspects.outerInitial")})` : ``}`;
    const degree = options.isAntiscion
      ? getDegreeAndSign(lot.antiscion, true)
      : lot.longitudeSign;

    return (
      <div className="flex flex-row items-center gap-1">
        {getArabicPartImage(lot, { isAntiscion: options.isAntiscion, size: 17 })}
        <span>{label}{options.isAntiscion ? ` Antiscion` : ""}: {formatSignColor(degree)}</span>
      </div>
    );
  }

  function makeFixedStarTooltip(star: AspectedElement): React.ReactNode {
    const degree = getDegreeAndSign(decimalToDegreesMinutes(star.longitude), true);
    const iconSrc = star.isRelevant ?  "/relevant-star.png" :  "/star-1.png";

    return (
      <div className="flex flex-row items-center gap-1">
        <img src={iconSrc} width={14} height={14} alt="star" />
        <span
          style={{ color: star.isRelevant ? "#4015fa" : undefined }}
        >
          {star.name}:
        </span>
        <span>{formatSignColor(degree)}</span>
      </div>
    );
  }

  function makeAspectTooltip(aspect: PlanetAspectData): React.ReactNode {
    return (
      <div className="flex flex-row items-center gap-1.5">
        {aspect.elementImg}
        {aspect.aspectImg}
        {aspect.aspectedElementImg}
        <span className="text-sm">{aspect.distance}</span>
        <span className="font-semibold">{aspect.distanceType}</span>
      </div>
    );
  }

  const planetIsolatedRef = useRef(false);

  function hideTooltip() {
    // Tooltip stays pinned while a planet is isolated
    if (planetIsolatedRef.current) return;
    if (!showDegrees) return;

    setTooltip(null);
  }

  function clearPlanetIsolation() {
    const baseGroup = baseGroupRef.current;
    planetIsolatedRef.current = false;
    setTooltip(null);
    if (!baseGroup) return;

    baseGroup.select(".highlight-layer").remove();

    const dimLayer = baseGroup.select<SVGGElement>(".dim-layer");
    if (dimLayer.empty()) return;

    dimLayer
      .interrupt()
      .transition()
      .duration(200)
      .style("opacity", 1)
      .on("end", () => {
        // Unwrap: move children back to baseGroup, keeping their order
        const layerNode = dimLayer.node()!;
        const baseNode = baseGroup.node()!;
        while (layerNode.firstChild) {
          baseNode.insertBefore(layerNode.firstChild, layerNode);
        }
        layerNode.remove();
      });
  }

  function isolatePlanet(planet: IsolatablePlanet) {
    const baseGroup = baseGroupRef.current;
    if (!baseGroup) return;
    const { xs, ys, iconSize, iconSrc, tick } = planet;

    planetIsolatedRef.current = true;

    // Reuses the dim layer if it is still fading out from a previous restore
    let dimLayer = baseGroup.select<SVGGElement>(".dim-layer");
    if (dimLayer.empty()) {
      dimLayer = baseGroup.insert("g", ":first-child").attr("class", "dim-layer");
      baseGroup
        .selectChildren<SVGElement, unknown>(":not(.dim-layer)")
        .each(function () {
          dimLayer.node()!.appendChild(this);
        });
    }

    dimLayer
      .interrupt()
      .attr("filter", `url(#${PLANET_DIM_FILTER_ID})`)
      .transition()
      .duration(200)
      .style("opacity", 0.3);

    baseGroup.select(".highlight-layer").remove();
    const highlightLayer = baseGroup.append("g").attr("class", "highlight-layer");

    // Huge transparent backdrop: a tap anywhere else restores the chart
    highlightLayer
      .append("rect")
      .attr("x", -10000)
      .attr("y", -10000)
      .attr("width", 20000)
      .attr("height", 20000)
      .attr("fill", "transparent")
      .on("click", clearPlanetIsolation);

    if (tick) {
      highlightLayer
        .append("line")
        .attr("x1", tick.x1)
        .attr("y1", tick.y1)
        .attr("x2", tick.x2)
        .attr("y2", tick.y2)
        .attr("stroke", tick.stroke ?? "black")
        .attr("stroke-width", 1);
    }

    const planetGroup = highlightLayer
      .append("g")
      .attr("transform", `translate(${xs}, ${ys}) scale(1)`)
      .style("cursor", "pointer")
      .on("click", (event: MouseEvent) => {
        event.stopPropagation();
        clearPlanetIsolation();
      });

    planetGroup
      .append("circle")
      .attr("r", iconSize * PLANET_HIGHLIGHT_RADIUS_FACTOR)
      .attr("fill", "white")
      .attr("stroke", "#333")
      .attr("stroke-width", 1.5);

    planetGroup
      .append("image")
      .attr("href", iconSrc)
      .attr("width", iconSize)
      .attr("height", iconSize)
      .attr("x", -iconSize / 2)
      .attr("y", -iconSize / 2);

    planetGroup
      .transition()
      .duration(200)
      .attr("transform", `translate(${xs}, ${ys}) scale(${PLANET_HIGHLIGHT_SCALE})`);
  }

  function bindPlanetHit(
    hit: d3.Selection<SVGRectElement, unknown, null, undefined>,
    planet: IsolatablePlanet
  ) {
    hit
      .style("cursor", "pointer")
      .on("mouseover", (event: MouseEvent) => {
        if (!isMobile && !planetIsolatedRef.current) showTooltip(event, planet.content);
      })
      .on("mouseout", () => {
        if (!isMobile) hideTooltip();
      })
      .on("click", (event: MouseEvent) => {
        // showTooltip(event, planet.content); // this is what shows it on mobile
        showTooltipBelowPlanet(hit.node()!, planet);
        isolatePlanet(planet);
      });
  }

  function isAngularHouse(element: ChartElement) {
    return element.name.endsWith("-0") || element.name.endsWith("3") ||
      element.name.endsWith("6") || element.name.endsWith("9");
  }

  /**
   * Returns the longitude (possibly nudged) and the radial offset where the
   * symbol must be drawn so it does not collide with the symbols already placed.
   * Layout details live in utils/symbolLayout.ts.
   */
  function getElementOverlapLongitudeAndOffset(
    chartElement: ChartElement
  ): ElementOverlapLongitudeAndOffset {
    const layout = symbolLayoutRef.current!;

    // Transits are also kept away from the angular house cusps (ASC/IC/DSC/MC).
    const avoidLongitudes = chartElement.isTransit
      ? chartElementsForAspect.current
          .filter((e) => e.elementType === "house" && !e.isFromOuterChart && isAngularHouse(e))
          .map((e) => e.longitude)
      : undefined;

    const { longitude, offset } = layout.place({
      longitude: chartElement.longitude,
      layer: chartElement.isFromOuterChart || chartElement.isTransit ? "outer" : "inner",
      avoidLongitudes,
    });

    return { longitude, offset };
  }

  const isTraditionalPlanet = (element: ChartElement): boolean => {
    return element.planetType !== "uranus" &&
      element.planetType !== "neptune" &&
      element.planetType !== "pluto" &&
      element.planetType !== "northNode" &&
      element.planetType !== "southNode";
  }

  function elementIsInIsolatedAspect (element: ChartElement): boolean {
    // const el = selectedAspectRef.current!.element;
    // const aspEl = selectedAspectRef.current!.aspectedElement;

    const el = selectedAspect!.element;
    const aspEl = selectedAspect!.aspectedElement;

    if(element.elementType === "planet") {
      const elIsAspect = el.name === element.planetType && el.elementType === element.elementType && 
        el.isAntiscion === element.isAntiscion && el.isFromOuterChart === element.isFromOuterChart 
        && el.longitude === element.longitude;
  
      const elIsAspected = aspEl.name === element.planetType && aspEl.elementType === element.elementType && 
        aspEl.isAntiscion === element.isAntiscion && aspEl.isFromOuterChart === element.isFromOuterChart 
        && aspEl.longitude === element.longitude;
  
      return elIsAspect || elIsAspected;
    }

    if(element.elementType === "arabicPart") {
      // if(element.name === "love") {
      //   console.log(selectedAspectRef.current);
      // }

      const elIsAspect = el.name === element.name && el.elementType === element.elementType && 
        el.isAntiscion === element.isAntiscion && el.isFromOuterChart === element.isFromOuterChart 
        && el.longitude === element.longitude;
  
      const elIsAspected = aspEl.name === element.name && aspEl.elementType === element.elementType && 
        aspEl.isAntiscion === element.isAntiscion && aspEl.isFromOuterChart === element.isFromOuterChart 
        && aspEl.longitude === element.longitude;
  
      return elIsAspect || elIsAspected;
    }

    return false;
  }

  function isAspectableElement(
    element: ChartElement,
    fixedStarAspect: boolean = false
  ): boolean {
    if (fixedStarAspect && element.isAntiscion) return false;
    if (fixedStarAspect && element.elementType === "arabicPart") return false;
    if (fixedStarAspect && !isTraditionalPlanet(element)) return false;
    if (!isTraditionalPlanet(element) && element.isAntiscion) return false;

    // if (element.elementType === "planet") {
    //   const isAspectablePlanet =
    //     element.planetType !== "uranus" &&
    //     element.planetType !== "neptune" &&
    //     element.planetType !== "pluto" &&
    //     element.planetType !== "northNode" &&
    //     element.planetType !== "southNode";
    //   return isAspectablePlanet;
    // }

    return true;
  }

  function aspectCanBeUsed(element: ChartElement, aspect: Aspect): boolean {
    if (element.elementType === "arabicPart") {
      return aspect.type === "conjunction" || aspect.type === "opposition";
    } else if (element.isAntiscion) {
      return aspect.type === "conjunction" || aspect.type === "opposition";
    } else if (element.elementType === "house")
      return aspect.type !== "sextile";
    else if (element.elementType === "planet" && !isTraditionalPlanet(element)) {
      return aspect.type === "conjunction";
    } else if(element.isTransit)
      return aspect.type === "conjunction" || aspect.type === "opposition"; 

    return true;
  }

  function generateAspectKey(
    element: ChartElement,
    aspectedElement: ChartElement,
    aspect: Aspect
  ): string {
    let elementKey: string =
      ((element.isFromOuterChart && !element.name.includes(fixedNames.outerKeyPrefix)) ?
      `${fixedNames.outerKeyPrefix}-` : "") + (element.planetType ?? element.name) + (element.isTransit ? '-transit' : '')
        .replace(fixedNames.antiscionName, "")
        // .replace("-", "");

    let aspectedName =
      aspectedElement.elementType === "fixedStar"
        ? aspectedElement.name.toLowerCase().replace(" ", "-")
        : aspectedElement.name;

    let aspectedElementKey: string =
      ((aspectedElement.isFromOuterChart && !aspectedElement.name.includes(fixedNames.outerKeyPrefix)) ? 
      `${fixedNames.outerKeyPrefix}-` : "") + (aspectedElement.planetType ?? aspectedName) + (aspectedElement.isTransit ? '-transit' : '')
      .replace(fixedNames.antiscionName,"");

    if (aspectedElement.elementType !== "fixedStar" && aspectedElementKey.endsWith("-")) {
      aspectedElementKey = aspectedElementKey.substring(0, aspectedElementKey.length - 1);
    }

    const result = `${elementKey}-${aspect.type}-${aspectedElementKey}`;

    return result;
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

  function getAspectLimitLongitude(
    valueToCheck: number,
    orb: number,
    orientation: OrbCalculationOrientation
  ): number {
    const valueSign = getSign(valueToCheck, true);
    let limit =
      orientation === "upper" ? valueToCheck + orb : valueToCheck - orb;
    const limitSign = getSign(limit, true);

    if (valueSign !== limitSign) {
      const signIndex = signsGlpyphs.indexOf(valueSign);
      limit = signIndex * 30 + (orientation === "upper" ? 29.59 : 0);

      // console.log(
      //   `valueSign: ${valueSign}, limitSign: ${limitSign}, limit is ${limit}`
      // );
      return limit;
    }

    return limit;
  }

  function getAspectOrb(
    element: ChartElement,
    aspectedElement: ChartElement,
    aspect: Aspect
  ): number {
    if (aspectedElement.elementType === "fixedStar") {
      const fixedStar = aspectedElement as FixedStar;

      if (fixedStar.magnitude >= 3) return 1;
      if (fixedStar.magnitude < 3) return 2;
    }

    if (
      (element.elementType === "arabicPart" &&
        aspectedElement.elementType !== "house") ||
      (element.elementType !== "house" &&
        aspectedElement.elementType === "arabicPart")
    )
      // some of them is arabic part and the other isn't house, so may be arabicPart or a planet,
      return 3;
    else if (
      (element.elementType === "house" ||
        aspectedElement.elementType === "house") &&
      aspect.type === "conjunction"
    )
      return 5; // houses cusps

    return 3; // default orb for planets and other house aspects
  }

  function elementIsEqualsTo(
    element: ChartElement,
    elToCheck: ChartElement
  ): boolean {
    const firstName = element.isAntiscion
      ? element.name.replace(fixedNames.antiscionName, "")
      : element.name;
    const secondName = elToCheck.isAntiscion
      ? elToCheck.name.replace(fixedNames.antiscionName, "")
      : elToCheck.name;

    let result = firstName === secondName;

    if (result) {
      result =
        (element.isFromOuterChart && elToCheck.isFromOuterChart) ||
        (!element.isFromOuterChart && !elToCheck.isFromOuterChart);
      return result;
    }

    return result;
  }

  function aspectNotRenderedYet(
    aspectsData: PlanetAspectData[],
    element: ChartElement,
    elToCheck: ChartElement,
    aspectToCheck: Aspect
  ): boolean {
    if (element.isAntiscion && elToCheck.isAntiscion)
      // is both are antiscion, the aspect has already been rendered into their normal position
      return false;

    const aspect = aspectsData.find(
      (asp) => asp.key === generateAspectKey(element, elToCheck, aspectToCheck)
    );

    return aspect === undefined;
  }

  function bothElementsAreHouses(
    element: ChartElement,
    elToCheck: ChartElement
  ): boolean {
    const _1stElementIsHouse = element.elementType === "house";
    const _2ndElementIsHouse = elToCheck.elementType === "house";

    if (_1stElementIsHouse) return _2ndElementIsHouse;

    return false;
  }

  function aspectElementsAreInProperSigns(
    element: ChartElement,
    elToCheck: ChartElement,
    aspect: Aspect
  ): boolean {
    const _1stElementSign = getSign(element.longitude, true);
    const _2ndElementSign = getSign(elToCheck.longitude, true);
    const _1stSignIndex = signsGlpyphs.indexOf(_1stElementSign);
    let expected2ndSign = _1stElementSign;

    if (aspect.type === "conjunction") {
      return _1stElementSign === _2ndElementSign;
    } else {
      let aspectOffset = 0;

      if (aspect.type === "opposition") aspectOffset = 6;
      else if (aspect.type === "trine") aspectOffset = 4;
      else if (aspect.type === "square") aspectOffset = 3;
      else if (aspect.type === "sextile") aspectOffset = 2;

      expected2ndSign = signsGlpyphs.find((_, index) => {
        return (_1stSignIndex + aspectOffset) % 12 === index;
      })!;

      if (aspect.type !== "opposition") {
        expected2ndSign +=
          ", " +
          signsGlpyphs.find((_, index) => {
            return (_1stSignIndex - aspectOffset) % 12 === index;
          })!;
      }

      return expected2ndSign.includes(_2ndElementSign);
    }
  }

  function isAspectBetweenTransaturninesAndArabicParts(element: ChartElement, elToCheck: ChartElement): boolean {
    return element.elementType === "arabicPart" && (elToCheck.elementType === "planet" && !isTraditionalPlanet(elToCheck)) ||
      elToCheck.elementType === "arabicPart" && (element.elementType === "planet" && !isTraditionalPlanet(element));
  }

  function elementsFromDifferentChartsWithIrrelevantAspect(element: ChartElement, elToCheck: ChartElement, aspect: Aspect): boolean {
    if (element.isFromOuterChart && !elToCheck.isFromOuterChart || !element.isFromOuterChart && elToCheck.isFromOuterChart) {
      return aspect.type === "square" || aspect.type === "sextile";
    }

    return false;
  }

  function getAspects(elements: ChartElement[]): PlanetAspectData[] {
    const aspectsData: PlanetAspectData[] = [];
    const aspectableElements = elements.filter((el) => isAspectableElement(el));

    aspectableElements.forEach((element) => {
      ASPECTS.forEach((aspect) => {
        if (aspectCanBeUsed(element, aspect)) {
          const elementsWithAspect = aspectableElements.filter((elToCheck) => {
            if (
              !elementIsEqualsTo(element, elToCheck) &&
              !bothElementsAreHouses(element, elToCheck) &&
              !isAspectBetweenTransaturninesAndArabicParts(element, elToCheck) &&
              aspectCanBeUsed(elToCheck, aspect) &&
              aspectNotRenderedYet(aspectsData, element, elToCheck, aspect) &&
              aspectElementsAreInProperSigns(element, elToCheck, aspect) &&
              !elementsFromDifferentChartsWithIrrelevantAspect(element, elToCheck, aspect)
            ) {
              const orb = getAspectOrb(element, elToCheck, aspect);
              const valToCheck = mod360(element.longitude + aspect.angle);

              const lowerLimit = getAspectLimitLongitude(
                mod360(elToCheck.longitude),
                orb,
                "lower"
              );
              const upperLimit = getAspectLimitLongitude(
                mod360(elToCheck.longitude),
                orb,
                "upper"
              );

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
                    elementType: element.elementType,
                    isFromOuterChart: element.isFromOuterChart!,
                    isAntiscion: element.isAntiscion,
                    isRetrograde: element.isRetrograde,
                    isTransit: element.isTransit
                  },
                  aspectedElement: {
                    name: elWithAsp.planetType ?? elWithAsp.name,
                    longitude: elWithAsp.longitude,
                    elementType: elWithAsp.elementType,
                    isFromOuterChart: elWithAsp.isFromOuterChart!,
                    isAntiscion: elWithAsp.isAntiscion,
                    isRetrograde: elWithAsp.isRetrograde,
                    isTransit: elWithAsp.isTransit
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

  function getAspectsWithFixedStars(
    elements: ChartElement[]
  ): PlanetAspectData[] {
    const aspectsData: PlanetAspectData[] = [];
    const aspectableElements = elements.filter(
      (el) => isAspectableElement(el, true) // flag for fixed stars
    );

    if (fixedStars === undefined) return [];

    const conjunction: Aspect = { type: "conjunction", angle: 0 };

    aspectableElements.forEach((element) => {
      const starsWithAspects = fixedStars.filter((star) => {
        if (aspectElementsAreInProperSigns(element, star, conjunction)) {
          const orb = getAspectOrb(element, star, conjunction);
          const valToCheck = mod360(element.longitude + conjunction.angle);

          const lowerLimit = getAspectLimitLongitude(
            mod360(star.longitude),
            orb,
            "lower"
          );
          const upperLimit = getAspectLimitLongitude(
            mod360(star.longitude),
            orb,
            "upper"
          );

          return valToCheck >= lowerLimit && valToCheck <= upperLimit;
        }
      });

      if (starsWithAspects.length > 0) {
        starsWithAspects.forEach((star) => {
          if (
            !aspectAlreadyRegistered(aspectsData, element, star, conjunction)
          ) {
            aspectsData.push({
              aspectType: conjunction.type,
              element: {
                name: element.planetType ?? element.name,
                longitude: element.longitude,
                elementType: element.elementType,
                isFromOuterChart: element.isFromOuterChart!,
                isAntiscion: element.isAntiscion,
                isRetrograde: element.isRetrograde,
                isTransit: element.isTransit
              },
              aspectedElement: {
                name: star.name,
                longitude: star.longitude,
                elementType: "fixedStar",
                isFromOuterChart: false,
                isAntiscion: false,
                isRetrograde: false,
                isTransit: false,
                isRelevant: star.isRelevant
              },
              key: generateAspectKey(element, star, conjunction),
            });
          }
        });
      }
    });

    // console.log(aspectsData);

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
    // const rSymbol = options.radius - symbolOffset;
    const rLineStart = options.radius - options.lineStartOffset;
    const rLineEnd = options.radius;

    // 4) cálculos das coordenadas
    // const xs = rSymbol * Math.cos(angleRad);
    // const ys = rSymbol * Math.sin(angleRad);

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
    // const angleLineRad = Math.atan2(y2 - y1, x2 - x1);
    // const angleLineDeg = (angleLineRad * 180) / Math.PI;

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

    aspectStrokeCoords.current.set(aspect.key, { x1, y1, x2, y2 });

    // se quiser ver o ângulo no console pra debug:
    // console.log('aspect', aspect.element.name, 'angleDeg', angleLineDeg);    
  }

  function isAspectWithHouse(aspect: PlanetAspectData): boolean {
    const elementIsHouse = aspect.element.elementType === "house";
    const aspectedElementIsHouse =
      aspect.aspectedElement.elementType === "house";

    return elementIsHouse || aspectedElementIsHouse;
  }

  function drawAspects(
    elements: ChartElement[],
    options: {
      baseGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
      radius: number;
      lineStartOffset: number;
    }
  ) {
    const aspectsData: PlanetAspectData[] = !hasIsolatedAspect ? getAspects(elements) : [selectedAspect!];
    const aspectsWithFixedStars = getAspectsWithFixedStars(elements);
    setFixedStarAspects(aspectsWithFixedStars);

    if(!hasIsolatedAspect)
      onUpdateAspectsData?.([...aspectsData, ...aspectsWithFixedStars]);
    else
      onUpdateAspectsData?.([...aspectsData]);

    aspectsData.forEach((aspect) => {
      if (!isAspectWithHouse(aspect) || hasIsolatedAspect) {
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
      }
    });
  }

  // Hooks

  useEffect(() => {
    if(useReturnSelectorArrows) {
      setShowAdvanceOptions(
        isTransitsChart() || 
        isMomentChart() || 
        currentProfile?.gender === "event"
      );
    }
  }, [])

  useEffect(() => {
    let logic = outerPlanets !== undefined && outerHouses !== undefined;
    setShowOuterChart(logic);
  }, [outerPlanets, outerHouses]);

  useEffect(() => {
    // console.log('arabicParts at AstroChart.tsx: ', arabicParts);
  }, [arabicParts])

  // Main useEffect
  useEffect(() => {
    if (!ref.current) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    chartElementsForAspect.current = [];
    symbolLayoutRef.current = new SymbolLayout({
      iconSize,
      baseOffset: symbolOffset,
      geometry: {
        inner: { baseRadius: chartInnerRadius, direction: -1 }, // grows toward the center
        outer: { baseRadius: outerZodiacRadius, direction: 1 }, // grows away from the zodiac
      },
    });

    zodiacRotationRef.current = zodiacRotation;
    radiusRef.current = radius;
    lineStartOffsetRef.current = lineStartOffset;

    // A redraw wipes the isolation layers, so reset the flag (and the pinned tooltip)
    if (planetIsolatedRef.current) {
      planetIsolatedRef.current = false;
      setTooltip(null);
    }

    // Grayscale filter used by the isolation dim layer (defs are wiped on every redraw)
    svg
      .append("defs")
      .append("filter")
      .attr("id", PLANET_DIM_FILTER_ID)
      .append("feColorMatrix")
      .attr("type", "saturate")
      .attr("values", "0");
   
    const baseGroup = svg
      .attr("width", scaledSize)
      .attr("height", scaledSize)
      .style("overflow", "visible")
      .append("g")
      .attr("transform", `translate(${center}, ${center})`)
      .attr(
        "transform",
        `translate(${center * scaleFactor}, ${center * scaleFactor
        }) scale(${scaleFactor})`
      );

    baseGroupRef.current = baseGroup;

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

    // Blue outer circle
    if (showOuterChart) {
      baseGroup
        .append("circle")
        .attr("r", outerChartBorderRadius)
        .attr("fill", "#f0ffff")
        .attr("stroke", "black")
        .attr("stroke-width", 1);
    }

    // Blue outer circle on Transits
    if (birthChart?.transits) {
      baseGroup
        .append("circle")
        .attr("r", outerChartBorderRadiusTransits)
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

    // Glifos dos signos centralizados nas fatias com cor por elemento
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

    const housesRotation = getHouseDataAscendant() - 90;
    const rotatedGroup = baseGroup
      .append("g")
      .attr("transform", `rotate(${housesRotation})`);

    rotatedGroup
      .append("circle")
      .attr("r", radius)
      .attr("fill", "white")
      .attr("stroke", "black")
      .attr("stroke-width", 1);

    // ===== Faces (decanatos) e Termos =====
    // Criado AQUI (depois do círculo branco de raio `radius`) para garantir que
    // fique visualmente por cima dele. Elementos SVG seguem a ordem de inserção
    // no DOM: como esse círculo branco opaco já existia antes, qualquer anel
    // desenhado dentro de zodiacGroup (criado mais acima, antes deste círculo)
    // ficaria coberto por ele, mesmo que o código que o desenha rode depois.
    // Por isso usamos um grupo novo, com a mesma rotação de zodiacGroup, inserido
    // neste ponto mais tardio do DOM.
    const dignitiesGroup = baseGroup
      .append("g");

    const termsIsActive = useTerms && currentTerms !== undefined;

    // Circunferência divisória entre os dois anéis: só faz sentido quando ambos
    // estão ativos ao mesmo tempo (separa Faces de Termos). Se só um estiver
    // ativo, ele já fica colado à borda do círculo zodiacal, sem precisar de divisória.
    if (useDecans && termsIsActive) {
      dignitiesGroup
        .append("circle")
        .attr("r", termsDivisionRadius)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 0.75);
    }

    function getDignityIconSrc(planet: PlanetType): string {
      return `/planets/${planet}.png`;
    }

    function drawDignityRing(options: {
      table: Record<Sign, TermOrDecan[]>;
      innerRadius: number;
      outerRadius: number;
      strokeColor: string;
    }) {
      const { table, innerRadius, outerRadius, strokeColor } = options;
      const midRadius = (innerRadius + outerRadius) / 2;

      SIGN_ORDER.forEach((signName, i) => {
        const divisions = table[signName];
        if (!divisions) return;

        divisions.forEach((division) => {
          // Longitude absoluta (0-360, Aries 0° como origem) do início e meio da divisão
          const startAbsDeg = i * 30 + division.start;
          const endAbsDeg = i * 30 + division.end;
          const midAbsDeg = (startAbsDeg + endAbsDeg) / 2;

          // Linha radial no início da divisão (mesma convenção usada pelos
          // planetas/elementos do mapa: 180 - longitude - 90, com a rotação do
          // zodíaco aplicada manualmente via subtração — igual aos planetas,
          // sem depender de transform de grupo, para garantir que os dois
          // sistemas usem exatamente o mesmo mecanismo e não corram risco de
          // sinais opostos entre rotação de grupo e subtração trigonométrica)
          const startRawDeg = 180 - startAbsDeg - 90;
          const startRawRad = (startRawDeg * Math.PI) / 180;
          const rotRad = (zodiacRotation * Math.PI) / 180;
          const startRad = startRawRad - rotRad;

          const lx1 = innerRadius * Math.cos(startRad);
          const ly1 = innerRadius * Math.sin(startRad);
          const lx2 = outerRadius * Math.cos(startRad);
          const ly2 = outerRadius * Math.sin(startRad);

          dignitiesGroup
            .append("line")
            .attr("x1", lx1)
            .attr("y1", ly1)
            .attr("x2", lx2)
            .attr("y2", ly2)
            .attr("stroke", strokeColor)
            .attr("stroke-width", 0.4);

          // Ícone do planeta regente, centrado no meio da divisão
          const midRawDeg = 180 - midAbsDeg - 90;
          const midRawRad = (midRawDeg * Math.PI) / 180;
          const midRad = midRawRad - rotRad;

          const ix = midRadius * Math.cos(midRad);
          const iy = midRadius * Math.sin(midRad);

          dignitiesGroup
            .append("image")
            .attr("href", getDignityIconSrc(division.ruler))
            .attr("width", dignityIconSize)
            .attr("height", dignityIconSize)
            .attr("x", ix - dignityIconSize / 2)
            .attr("y", iy - dignityIconSize / 2);
        });
      });
    }

    if (useDecans) {
      drawDignityRing({
        table: CHALDEAN_DECANS,
        innerRadius: decansRingInner,
        outerRadius: decansRingOuter,
        strokeColor: "black",
      });
    }

    if (termsIsActive) {
      drawDignityRing({
        table: currentTerms!,
        innerRadius: termsRingInner,
        outerRadius: termsRingOuter,
        strokeColor: "black",
      });
    }

    // Fecha a borda interna do anel mais interno ativo (Termos, se ativo; senão Faces).
    // Sem essa circunferência, os "arcos" de cada divisão ficam abertos por dentro.
    if (useDecans || termsIsActive) {
      dignitiesGroup
        .append("circle")
        .attr("r", chartInnerRadius)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 0.75);
    }
    // ===== Fim Faces e Termos =====

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

    // normaliza Ascendente e cúspides
    const asc = ((getHouseDataAscendant() % 360) + 360) % 360;
    const cusps = housesData?.house.map((a) => ((a % 360) + 360) % 360);

    // Números das casas.
    // Percorre 0 a 11 diretamente (já é anti‑horário começando no Ascendente)
    for (let j = 0; j < 12; j++) {
      if (cusps === undefined) {
        break;
      }

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

      // Hit area + tooltip da casa
      const houseContent = makeHouseTooltip(j, decimalToDegreesMinutes(cusps[j]));
      const startRad = Math.PI - ((cusps[j] - asc + 360) % 360 * Math.PI / 180);
      const endRad = Math.PI - ((cusps[(j + 1) % 12] - asc + 360) % 360 * Math.PI / 180);

      const r1 = smallInnerRadius;
      const r2 = smallOuterRadius;
      // const r2 = radius;

      // 4 pontos do arco
      const x1 = r1 * Math.cos(startRad);
      const y1 = r1 * Math.sin(startRad);
      const x2 = r2 * Math.cos(startRad);
      const y2 = r2 * Math.sin(startRad);
      const x3 = r2 * Math.cos(endRad);
      const y3 = r2 * Math.sin(endRad);
      const x4 = r1 * Math.cos(endRad);
      const y4 = r1 * Math.sin(endRad);

      // span para saber se o arco é maior que 180°
      const spanDeg = ((cusps[(j + 1) % 12] - cusps[j] + 360) % 360);
      const largeArc = spanDeg > 180 ? 1 : 0;

      const pathD = [
        `M ${x1} ${y1}`,
        `L ${x2} ${y2}`,
        `A ${r2} ${r2} 0 ${largeArc} 0 ${x3} ${y3}`,
        `L ${x4} ${y4}`,
        `A ${r1} ${r1} 0 ${largeArc} 1 ${x1} ${y1}`,
        "Z"
      ].join(" ");

      centerCircles
        .append("path")
        .attr("d", pathD)
        .attr("fill", "transparent")
        .on(isMobile ? "click" : "mouseover", (event: MouseEvent) => {
          showTooltip(event, houseContent);
        })
        .on("mouseout", () => {
          if (!isMobile) hideTooltip();
        });

      let txt = (j + 1).toString();
      if (showOuterChart && j % 3 === 0) txt = angularLabels[j];

      centerCircles
        .append("text")
        .attr("x", x)
        .attr("y", y)
        .attr("font-size", 10)
        .attr("text-anchor", "middle")
        .attr("font-weight", showOuterChart && j % 3 === 0 ? "bold" : "plain")
        .attr("alignment-baseline", "middle")
        .text(txt)
        .on(isMobile ? "click" : "mouseover", (event: MouseEvent) => {
          showTooltip(event, houseContent);
        })
        .on("mouseout", () => {
          if (!isMobile) hideTooltip();
        });
    }

    const innerCircleRadius = smallInnerRadius; // ou o valor que você estiver usando
    // parâmetros de styling
    const houseLineStrokeWidth = (i: number) => (i % 3 === 0 ? 2 : 0.5);

    const continuationLength = 25; // comprimento do traço de continuidade
    const labelOffset = 25; // distância extra para posicionar o texto

    // Linhas externas de grau (a cada 10°)
    if (!showOuterChart) {
      for (let deg = 0; deg < 360; deg += 10) {
        const angleSVG = 360 - deg - 90;
        const rad = (angleSVG * Math.PI) / 180;

        const inner = outerZodiacRadius;
        const outer = outerZodiacRadius + (birthChart?.transits ? 6 : 12); // aumenta comprimento (de +6 para +12)
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
        const outer = outerZodiacRadius + (birthChart?.transits ? 4 : 8); // um pouco menor que as de 10°
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

    // Aspect lines live in their own layer, created BEFORE any symbol is drawn,
    // so planets / antiscia / lots always render on top of the aspect lines.
    const aspectsLayer = baseGroup.append("g").attr("class", "aspects-layer");

    // Desenha os planetas
    planets
    ?.filter((planet) => showTransSaturnians || !TRANS_SATURNIAN_TYPES.includes(planet.type))
    .forEach((planet) => {
      const chartElement: ChartElement = {
        id: chartElementsForAspect.current.length,
        isAntiscion: false,
        longitude: planet.longitude,
        name: planet.name,
        elementType: "planet",
        planetType: planet.type,
        isFromOuterChart: false,
        isRetrograde: planet.isRetrograde,
      };

      let canDrawPlanet = true;
      if(hasIsolatedAspect)
        canDrawPlanet = elementIsInIsolatedAspect(chartElement);

      if(canDrawPlanet) {
        let overlapData = getElementOverlapLongitudeAndOffset(chartElement);
  
        // 1) ângulo zodiacal original (graus → rad)
        const rawDegOriginal = 180 - (planet.longitude % 360) - 90;
        const rawDegOverlapped = 180 - (overlapData.longitude % 360) - 90;
        const rawRadOriginal = (rawDegOriginal * Math.PI) / 180;
        const rawRadOverlapped = (rawDegOverlapped * Math.PI) / 180;
  
        // 2) compensa a rotação do zodíaco (transforma em ângulo final)
        const rotRad = (zodiacRotation * Math.PI) / 180;
        const angleRadOriginal = rawRadOriginal - rotRad;
        const angleRadOverlapped = rawRadOverlapped - rotRad;
  
        // 3) offsets de sobreposição
        // const rSymbol = chartInnerRadius - symbolOffset;
        const rSymbol = chartInnerRadius - overlapData.offset;
        const rLineStart = chartInnerRadius - lineStartOffset;
        const rLineEnd = chartInnerRadius;
  
        // 4) cálculos das coordenadas
        const xs = rSymbol * Math.cos(angleRadOverlapped);
        const ys = rSymbol * Math.sin(angleRadOverlapped);
  
        const x1 = rLineStart * Math.cos(angleRadOriginal);
        const y1 = rLineStart * Math.sin(angleRadOriginal);
        const x2 = rLineEnd * Math.cos(angleRadOriginal);
        const y2 = rLineEnd * Math.sin(angleRadOriginal);          
  
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
        const iconSrc = getPlanetImagePath(planet.type, {
          longitude: planet.longitude,
          isRetrograde: planet.isRetrograde,
        });
  
        baseGroup
          .attr("data-name", planet.type)
          .append("image")
          .attr("href", iconSrc) // no D3 v6+ use 'href'
          .attr("width", iconSize)
          .attr("height", iconSize)
          .attr("x", xs - iconSize / 2)
          .attr("y", ys - iconSize / 2);
  
        const planetName = t(`planets.${planet.type}`);
        const content = makePlanetTooltip({
          label: planetName,
          longitude: planet.longitude,
          planetType: planet.type,
          isAntiscion: false,
          isRetrograde: planet.isRetrograde,
          isTransit: planet.isTransit
        });

        baseGroup
          .append("rect") // área de hit invisível, mais fácil de clicar que image
          .attr("x", xs - iconSize / 2 - 4)
          .attr("y", ys - iconSize / 2 - 4)
          .attr("width", iconSize + 8)
          .attr("height", iconSize + 8)
          .attr("fill", "transparent")
          .on(isMobile ? "click" : "mouseover", (event: MouseEvent) => {
            showTooltip(event, content);
          })
          .on("mouseout", () => {
            if (!isMobile) hideTooltip();
          });

        const planetHit = baseGroup
          .append("rect") // invisible hit area, easier to click than the image
          .attr("x", xs - iconSize / 2 - 4)
          .attr("y", ys - iconSize / 2 - 4)
          .attr("width", iconSize + 8)
          .attr("height", iconSize + 8)
          .attr("fill", "transparent");

        bindPlanetHit(planetHit, {
          xs,
          ys,
          iconSize,
          iconSrc,
          content,
          tick: { x1, y1, x2, y2 },
        });
  
        chartElementsForAspect.current = [
          ...chartElementsForAspect.current,
          chartElement,
        ];
      }

      if (showPlanetsAntiscia) {
        const antiscionElement: ChartElement = {
          id: chartElementsForAspect.current.length,
          isAntiscion: true,
          longitude: planet.antiscion,
          name: `${planet.name}-${fixedNames.antiscionName}`,
          elementType: "planet",
          planetType: planet.type,
          isFromOuterChart: false,
          isRetrograde: planet.isRetrograde,
        };

        canDrawPlanet = true;
        if(hasIsolatedAspect)
          canDrawPlanet = elementIsInIsolatedAspect(antiscionElement);

        if(canDrawPlanet && isTraditionalPlanet(antiscionElement)) {
          const overlapData = getElementOverlapLongitudeAndOffset(antiscionElement);

          // 1) ângulo zodiacal original (graus → rad)
          const rawAntDegOriginal = 180 - (planet.antiscion % 360) - 90;
          const rawAntDegOverlapped = 180 - (overlapData.longitude % 360) - 90;
          const rawRadOriginal = (rawAntDegOriginal * Math.PI) / 180;
          const rawRadOverlapped = (rawAntDegOverlapped * Math.PI) / 180;

          // 2) compensa a rotação do zodíaco (transforma em ângulo final)
          const rotAntRad = (zodiacRotation * Math.PI) / 180;
          const angleRadOriginal = rawRadOriginal - rotAntRad;
          const angleRadOverlapped = rawRadOverlapped - rotAntRad;

          // 3) offsets de sobreposição
          // const rAntSymbol = chartInnerRadius - symbolOffset;
          const rAntSymbol = chartInnerRadius - overlapData.offset;
          const rAntLineStart = chartInnerRadius - lineStartOffset;
          const AntLineEnd = chartInnerRadius;

          // 4) cálculos das coordenadas
          const xAnts = rAntSymbol * Math.cos(angleRadOverlapped);
          const yAnts = rAntSymbol * Math.sin(angleRadOverlapped);

          const xAnt1 = rAntLineStart * Math.cos(angleRadOriginal);
          const yAnt1 = rAntLineStart * Math.sin(angleRadOriginal);
          const xAnt2 = AntLineEnd * Math.cos(angleRadOriginal);
          const yAnt2 = AntLineEnd * Math.sin(angleRadOriginal);

          // 5) desenha a linha
          baseGroup
            .append("line")
            .attr("x1", xAnt1)
            .attr("y1", yAnt1)
            .attr("x2", xAnt2)
            .attr("y2", yAnt2)
            .attr("stroke", "#778397") // antiscion color
            .attr("stroke-width", 1);

          // 6) desenha o ícone do planeta
          const iconAntSize = 13; // px
          const iconAntSrc = getPlanetImagePath(planet.type, {
            isAntiscion: true,
            isRetrograde: planet.isRetrograde,
          });

          baseGroup
            .append("image")
            .attr("href", iconAntSrc) // no D3 v6+ use 'href'
            .attr("width", iconAntSize)
            .attr("height", iconAntSize)
            // centraliza o ícone em (xs, ys)
            .attr("x", xAnts - iconAntSize / 2)
            .attr("y", yAnts - iconAntSize / 2);

          const planetName = t(`planets.${planet.type}`);
          const content = makePlanetTooltip({
            label: `${planetName} Antiscion`,
            longitude: planet.antiscion,
            planetType: planet.type,
            isAntiscion: true,
            isRetrograde: planet.isRetrograde
          });

          baseGroup
            .append("rect") // área de hit invisível, mais fácil de clicar que image
            .attr("x", xAnts - iconSize / 2 - 4)
            .attr("y", yAnts - iconSize / 2 - 4)
            .attr("width", iconSize + 8)
            .attr("height", iconSize + 8)
            .attr("fill", "transparent")
            .on(isMobile ? "click" : "mouseover", (event: MouseEvent) => {
              showTooltip(event, content);
            })
            .on("mouseout", () => {
              if (!isMobile) hideTooltip();
            });

          const planetHit = baseGroup
            .append("rect") // invisible hit area, easier to click than the image
            .attr("x", xAnts - iconSize / 2 - 4)
            .attr("y", yAnts - iconSize / 2 - 4)
            .attr("width", iconSize + 8)
            .attr("height", iconSize + 8)
            .attr("fill", "transparent");

          bindPlanetHit(planetHit, {
            xs: xAnts,
            ys: yAnts,
            iconSize,
            iconSrc: iconAntSrc,
            content,
            tick: { x1: xAnt1, y1: yAnt1, x2: xAnt2, y2: yAnt2 },
          });
          
          chartElementsForAspect.current = [
            ...chartElementsForAspect.current,
            antiscionElement,
          ];
        }
      }
    });    

    if (showArabicParts && arabicParts !== undefined) {
      arabicPartKeys.forEach((key) => {
        const isCustomArabicPart = customArabicPart 
          && arabicParts[key]?.partKey === customArabicPart.partKey 
          && !customArabicPart.isFromOuterChart;

        const lot = isCustomArabicPart ? customArabicPart : arabicParts[key]!;

        if ((lot !== undefined && lot.planet) || (isCustomArabicPart)) {
          const lotChartElement: ChartElement = {
            id: chartElementsForAspect.current.length,
            isAntiscion: false,
            longitude: lot.longitude,
            name: lot.partKey,
            elementType: "arabicPart",
            isFromOuterChart: false,
            isRetrograde: false,
          };

          let canDrawArabicPart = true;
          if(hasIsolatedAspect)
            canDrawArabicPart = elementIsInIsolatedAspect(lotChartElement);                    

          if(canDrawArabicPart) {
            const overlapData =
              getElementOverlapLongitudeAndOffset(lotChartElement);
  
            // 1) ângulo zodiacal original (graus → rad)
            const rawDegOriginal = 180 - (lot.longitude % 360) - 90;
            const rawDegOverlapped = 180 - (overlapData.longitude % 360) - 90;
            const rawRadOriginal = (rawDegOriginal * Math.PI) / 180;
            const rawRadOverlapped = (rawDegOverlapped * Math.PI) / 180;
  
            // 2) compensa a rotação do zodíaco (transforma em ângulo final)
            const rotRad = (zodiacRotation * Math.PI) / 180;
            const angleRadOriginal = rawRadOriginal - rotRad;
            const angleRadOverlapped = rawRadOverlapped - rotRad;
  
            // 3) offsets de sobreposição
            const rSymbol = chartInnerRadius - overlapData.offset;
            const rLineStart = chartInnerRadius - lineStartOffset;
            const rLineEnd = chartInnerRadius;
  
            // 4) cálculos das coordenadas
            const xs = rSymbol * Math.cos(angleRadOverlapped);
            const ys = rSymbol * Math.sin(angleRadOverlapped);
  
            const x1 = rLineStart * Math.cos(angleRadOriginal);
            const y1 = rLineStart * Math.sin(angleRadOriginal);
            const x2 = rLineEnd * Math.cos(angleRadOriginal);
            const y2 = rLineEnd * Math.sin(angleRadOriginal);
  
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
            const iconSrc = `/planets/${!isCustomArabicPart ? key : "custom-lot"}.png`;
  
            baseGroup
              .append("image")
              .attr("href", iconSrc) // no D3 v6+ use 'href'
              .attr("width", iconSize)
              .attr("height", iconSize)
              // centraliza o ícone em (xs, ys)
              .attr("x", xs - iconSize / 2)
              .attr("y", ys - iconSize / 2);
  
            const content = makeArabicPartTooltip(lot, {isAntiscion: false});
  
            baseGroup
              .append("rect")
              .attr("x", xs - iconSize / 2 - 4)
              .attr("y", ys - iconSize / 2 - 4)
              .attr("width", iconSize + 8)
              .attr("height", iconSize + 8)
              .attr("fill", "transparent")
              .on(isMobile ? "click" : "mouseover", (event: MouseEvent) => {
                showTooltip(event, content);
              })
              .on("mouseout", () => {
                if (!isMobile) hideTooltip();
              });
   
            const planetHit = baseGroup
            .append("rect") // invisible hit area, easier to click than the image
            .attr("x", xs - iconSize / 2 - 4)
            .attr("y", ys - iconSize / 2 - 4)
            .attr("width", iconSize + 8)
            .attr("height", iconSize + 8)
            .attr("fill", "transparent");

            bindPlanetHit(planetHit, {
              xs: xs,
              ys: ys,
              iconSize,
              iconSrc,
              content,
              tick: { x1, y1, x2, y2 },
            });

            chartElementsForAspect.current = [
              ...chartElementsForAspect.current,
              lotChartElement,
            ];
          }
        }
      });
    }

    if (showArabicPartsAntiscia && arabicParts !== undefined) {
      arabicPartKeys.forEach((key) => {
        const isCustomArabicPart = customArabicPart 
          && arabicParts[key]?.partKey === customArabicPart.partKey 
          && !customArabicPart.isFromOuterChart;

          const lot = isCustomArabicPart ? customArabicPart : arabicParts[key]!;

        if ((lot !== undefined && lot.planet) || isCustomArabicPart) {
          const lotAntiscionChartElement: ChartElement = {
            id: chartElementsForAspect.current.length,
            isAntiscion: true,
            longitude: lot.antiscion,
            name: `${lot.partKey}-${fixedNames.antiscionName}`,
            elementType: "arabicPart",
            isFromOuterChart: false,
            isRetrograde: false,
          };

          let canDrawArabicPart = true;
          if(hasIsolatedAspect)
            canDrawArabicPart = elementIsInIsolatedAspect(lotAntiscionChartElement);

          if(canDrawArabicPart) {

            const overlapData = getElementOverlapLongitudeAndOffset(
              lotAntiscionChartElement
            );
  
            // 1) ângulo zodiacal original (graus → rad)
            const rawDegOriginal = 180 - (lot.antiscion % 360) - 90;
            const rawDegOverlapped = 180 - (overlapData.longitude % 360) - 90;
            const rawRadOriginal = (rawDegOriginal * Math.PI) / 180;
            const rawRadOverlapped = (rawDegOverlapped * Math.PI) / 180;
  
            // 2) compensa a rotação do zodíaco (transforma em ângulo final)
            const rotRad = (zodiacRotation * Math.PI) / 180;
            const angleRadOriginal = rawRadOriginal - rotRad;
            const angleRadOverlapped = rawRadOverlapped - rotRad;
  
            // 3) offsets de sobreposição
            const rSymbol = chartInnerRadius - overlapData.offset;
            const rLineStart = chartInnerRadius - lineStartOffset;
            const rLineEnd = chartInnerRadius;
  
            // 4) cálculos das coordenadas
            const xs = rSymbol * Math.cos(angleRadOverlapped);
            const ys = rSymbol * Math.sin(angleRadOverlapped);
  
            const x1 = rLineStart * Math.cos(angleRadOriginal);
            const y1 = rLineStart * Math.sin(angleRadOriginal);
            const x2 = rLineEnd * Math.cos(angleRadOriginal);
            const y2 = rLineEnd * Math.sin(angleRadOriginal);
  
            // 5) desenha a linha
            baseGroup
              .append("line")
              .attr("x1", x1)
              .attr("y1", y1)
              .attr("x2", x2)
              .attr("y2", y2)
              .attr("stroke", "#778397") // antiscion color
              .attr("stroke-width", 1);
  
            // 6) desenha o ícone do planeta
            const iconSize = 13; // px
            const iconSrc = `/planets/antiscion/${!isCustomArabicPart ? key : "custom-lot"}.png`;
  
            baseGroup
              .append("image")
              .attr("href", iconSrc) // no D3 v6+ use 'href'
              .attr("width", iconSize)
              .attr("height", iconSize)
              // centraliza o ícone em (xs, ys)
              .attr("x", xs - iconSize / 2)
              .attr("y", ys - iconSize / 2);
  
            
            const content = makeArabicPartTooltip(lot, {isAntiscion: true});
  
            baseGroup
              .append("rect")
              .attr("x", xs - iconSize / 2 - 4)
              .attr("y", ys - iconSize / 2 - 4)
              .attr("width", iconSize + 8)
              .attr("height", iconSize + 8)
              .attr("fill", "transparent")
              .on(isMobile ? "click" : "mouseover", (event: MouseEvent) => {
                showTooltip(event, content);
              })
              .on("mouseout", () => {
                if (!isMobile) hideTooltip();
              });
  
            baseGroup
              .append("rect")
              .attr("x", xs - iconSize / 2 - 4)
              .attr("y", ys - iconSize / 2 - 4)
              .attr("width", iconSize + 8)
              .attr("height", iconSize + 8)
              .attr("fill", "transparent")
              .on(isMobile ? "click" : "mouseover", (event: MouseEvent) => {
                showTooltip(event, content);
              })
              .on("mouseout", () => {
                if (!isMobile) hideTooltip();
              });
  
            const planetHit = baseGroup
              .append("rect") // invisible hit area, easier to click than the image
              .attr("x", xs - iconSize / 2 - 4)
              .attr("y", ys - iconSize / 2 - 4)
              .attr("width", iconSize + 8)
              .attr("height", iconSize + 8)
              .attr("fill", "transparent");

            bindPlanetHit(planetHit, {
              xs,
              ys,
              iconSize,
              iconSrc,
              content,
              tick: { x1, y1, x2, y2 },
            });
              
            chartElementsForAspect.current = [
              ...chartElementsForAspect.current,
              lotAntiscionChartElement,
            ];
          }
        }
      });      
    }

    // Desenha as cúspide das casas do mapa interno
    for (let i = 0; i < 12; i++) {
      if (cusps === undefined) break;

      const start = cusps[i];
      const angleRad = ((-start - 90) * Math.PI) / 180;

      // ponto inicial da linha (já definido por você)
      const x1 = i % 3 === 0 ? 0 : innerCircleRadius * Math.cos(angleRad);
      const y1 = i % 3 === 0 ? 0 : innerCircleRadius * Math.sin(angleRad);
      // ponto final da cúspide
      const x2 = chartInnerRadius * Math.cos(angleRad);
      const y2 = chartInnerRadius * Math.sin(angleRad);

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
      if (!showOuterChart && i % 3 === 0) {
        // 1) pequeno traço de continuidade
        const originLineX = outerZodiacRadius * Math.cos(angleRad);
        const originLineY = outerZodiacRadius * Math.sin(angleRad);

        const finalLineX = (outerZodiacRadius + (birthChart?.transits ? 6 : 12)) * Math.cos(angleRad);
        const finalLineY = (outerZodiacRadius + (birthChart?.transits ? 6 : 12)) * Math.sin(angleRad);

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

      chartElementsForAspect.current = [
        ...chartElementsForAspect.current,
        {
          id: chartElementsForAspect.current.length,
          isAntiscion: false,
          longitude: decimalToDegreesMinutes(start),
          name: `${fixedNames.houseName}-${i}`,
          elementType: "house",
          isFromOuterChart: false,
          isRetrograde: false,
          isTransit: false
        }
      ];
    }

    birthChart?.transits?.planets.forEach((planet) => {
      const chartElement: ChartElement = {
        id: chartElementsForAspect.current.length,
        isAntiscion: false,
        longitude: planet.longitude,
        name: planet.name,
        elementType: "planet",
        planetType: planet.type,
        isFromOuterChart: false,
        isRetrograde: planet.isRetrograde,
        isTransit: true
      };

      let canDrawPlanet = true;
      if(hasIsolatedAspect)
        canDrawPlanet = elementIsInIsolatedAspect(chartElement);

      if(canDrawPlanet) {
        let overlapData = getElementOverlapLongitudeAndOffset(chartElement);
  
        // 1) ângulo zodiacal original (graus → rad)
        const rawDegOriginal = 180 - (planet.longitude % 360) - 90;
        const rawDegOverlapped = 180 - (overlapData.longitude % 360) - 90;
        const rawRadOriginal = (rawDegOriginal * Math.PI) / 180;
        const rawRadOverlapped = (rawDegOverlapped * Math.PI) / 180;
  
        // 2) compensa a rotação do zodíaco (transforma em ângulo final)
        const rotRad = (zodiacRotation * Math.PI) / 180;
        const angleRadOriginal = rawRadOriginal - rotRad;
        const angleRadOverlapped = rawRadOverlapped - rotRad;
  
        // 3) offsets de sobreposição
        const rSymbol = outerZodiacRadius + overlapData.offset;
        const rLineStart = chartInnerRadius - lineStartOffset;
        const rLineEnd = chartInnerRadius;
  
        // 4) cálculos das coordenadas
        const xs = rSymbol * Math.cos(angleRadOverlapped);
        const ys = rSymbol * Math.sin(angleRadOverlapped);
  
        const x1 = rLineStart * Math.cos(angleRadOriginal);
        const y1 = rLineStart * Math.sin(angleRadOriginal);
        const x2 = rLineEnd * Math.cos(angleRadOriginal);
        const y2 = rLineEnd * Math.sin(angleRadOriginal);    
        
        const rLineStartOuter = outerZodiacRadius;
        const rLineEndOuter = outerZodiacRadius + 5;
        const x1Outer = rLineStartOuter * Math.cos(angleRadOriginal);
        const y1Outer = rLineStartOuter * Math.sin(angleRadOriginal);
        const x2Outer = rLineEndOuter * Math.cos(angleRadOriginal);
        const y2Outer = rLineEndOuter * Math.sin(angleRadOriginal);
  
        // 5) desenha a linha interna
        baseGroup
          .attr("data-name", planet.type)
          .append("line")
          .attr("x1", x1)
          .attr("y1", y1)
          .attr("x2", x2)
          .attr("y2", y2)
          .attr("stroke", "#005f73")
          .attr("stroke-width", 1);

        // 5) desenha a linha externa
        baseGroup
          .attr("data-name", planet.type)
          .append("line")
          .attr("x1", x1Outer)
          .attr("y1", y1Outer)
          .attr("x2", x2Outer)
          .attr("y2", y2Outer)
          .attr("stroke", "#005f73")
          .attr("stroke-width", 1);
  
        // 6) desenha o ícone do planeta
        const iconSrc = getPlanetImagePath(planet.type, {
          isRetrograde: planet.isRetrograde,
          isTransit: true,
        });
  
        baseGroup
          .attr("data-name", planet.type)
          .append("image")
          .attr("href", iconSrc) // no D3 v6+ use 'href'
          .attr("width", iconSize)
          .attr("height", iconSize)
          .attr("x", xs - iconSize / 2)
          .attr("y", ys - iconSize / 2);
  
          const planetName = t(`planets.${planet.type}`);
          const content = makePlanetTooltip({
            label: planetName,
            longitude: planet.longitude,
            planetType: planet.type,
            isAntiscion: false,
            isRetrograde: planet.isRetrograde,
            isTransit: true
          });
  
          baseGroup
            .append("rect") // área de hit invisível, mais fácil de clicar que image
            .attr("x", xs - iconSize / 2 - 4)
            .attr("y", ys - iconSize / 2 - 4)
            .attr("width", iconSize + 8)
            .attr("height", iconSize + 8)
            .attr("fill", "transparent")
            .on(isMobile ? "click" : "mouseover", (event: MouseEvent) => {
              showTooltip(event, content);
            })
            .on("mouseout", () => {
              if (!isMobile) hideTooltip();
            });
  
        chartElementsForAspect.current = [
          ...chartElementsForAspect.current,
          chartElement,
        ];
      }
    })

    if (showOuterChart && outerPlanets) {
      outerPlanets
      .filter((planet) => showTransSaturnians || !TRANS_SATURNIAN_TYPES.includes(planet.type))
      .forEach((planet) => {
        const chartElement: ChartElement = {
          id: chartElementsForAspect.current.length,
          isAntiscion: false,
          longitude: planet.longitude,
          name: planet.name,
          elementType: "planet",
          planetType: planet.type,
          isFromOuterChart: true,
          isRetrograde: planet.isRetrograde,
        };

        let canDrawPlanet = true;
        if(hasIsolatedAspect)
          canDrawPlanet = elementIsInIsolatedAspect(chartElement);

        if(canDrawPlanet) {
          let overlapData = getElementOverlapLongitudeAndOffset(chartElement);
  
          // 1) ângulo zodiacal original (graus → rad)
          const rawDegOriginal = 180 - (planet.longitude % 360) - 90;
          const rawDegOverlapped = 180 - (overlapData.longitude % 360) - 90;
          const rawRadOriginal = (rawDegOriginal * Math.PI) / 180;
          const rawRadOverlapped = (rawDegOverlapped * Math.PI) / 180;
  
          // 2) compensa a rotação do zodíaco (transforma em ângulo final)
          const rotRad = (zodiacRotation * Math.PI) / 180;
          const angleRadOriginal = rawRadOriginal - rotRad;
          const angleRadOverlapped = rawRadOverlapped - rotRad;
  
          // 3) offsets de sobreposição
          // const rSymbol = radius - symbolOffset;
          const rSymbol = outerZodiacRadius + overlapData.offset;
          const rLineStart = outerZodiacRadius + lineStartOffset;
          const rLineEnd = outerZodiacRadius;
  
          // 4) cálculos das coordenadas
          const xs = rSymbol * Math.cos(angleRadOverlapped);
          const ys = rSymbol * Math.sin(angleRadOverlapped);
  
          const x1 = rLineStart * Math.cos(angleRadOriginal);
          const y1 = rLineStart * Math.sin(angleRadOriginal);
          const x2 = rLineEnd * Math.cos(angleRadOriginal);
          const y2 = rLineEnd * Math.sin(angleRadOriginal);
  
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
          const iconSrc = getPlanetImagePath(planet.type, {
            longitude: planet.longitude,
            isRetrograde: planet.isRetrograde,
          });
  
          baseGroup
            .append("image")
            .attr("href", iconSrc) // no D3 v6+ use 'href'
            .attr("width", iconSize)
            .attr("height", iconSize)
            .attr("x", xs - iconSize / 2)
            .attr("y", ys - iconSize / 2);
  
          const planetName = t(`planets.${planet.type}`);
          const content = makePlanetTooltip({
            label: `${planetName} (${outerInitial})`,
            longitude: planet.longitude,
            planetType: planet.type,
            isAntiscion: false,
            isRetrograde: planet.isRetrograde,
          });
  
          baseGroup
            .append("rect") // área de hit invisível, mais fácil de clicar que image
            .attr("x", xs - iconSize / 2 - 4)
            .attr("y", ys - iconSize / 2 - 4)
            .attr("width", iconSize + 8)
            .attr("height", iconSize + 8)
            .attr("fill", "transparent")
            .on(isMobile ? "click" : "mouseover", (event: MouseEvent) => {
              showTooltip(event, content);
            })
            .on("mouseout", () => {
              if (!isMobile) hideTooltip();
            });
          
          const planetHit = baseGroup
            .append("rect") // invisible hit area, easier to click than the image
            .attr("x", xs - iconSize / 2 - 4)
            .attr("y", ys - iconSize / 2 - 4)
            .attr("width", iconSize + 8)
            .attr("height", iconSize + 8)
            .attr("fill", "transparent");

          bindPlanetHit(planetHit, {
            xs,
            ys,
            iconSize,
            iconSrc,
            content,
            tick: { x1, y1, x2, y2 },
          });

          chartElementsForAspect.current = [
            ...chartElementsForAspect.current,
            chartElement,
          ];
        }

        if (showPlanetsAntiscia) {
          const chartElementAntiscion: ChartElement = {
            id: chartElementsForAspect.current.length,
            isAntiscion: true,
            longitude: planet.antiscion,
            name: `${fixedNames.outerKeyPrefix}-${planet.name}-${fixedNames.antiscionName}`,
            elementType: "planet",
            planetType: planet.type,
            isFromOuterChart: true,
            isRetrograde: planet.isRetrograde,
          };

          let canDrawPlanet = true;
          if(hasIsolatedAspect)
            canDrawPlanet = elementIsInIsolatedAspect(chartElementAntiscion);

          if (canDrawPlanet && isTraditionalPlanet(chartElementAntiscion)) {
            let overlapData = getElementOverlapLongitudeAndOffset(
              chartElementAntiscion
            );

            // 1) ângulo zodiacal original (graus → rad)
            const rawDegOriginal = 180 - (planet.antiscion % 360) - 90;
            const rawDegOverlapped = 180 - (overlapData.longitude % 360) - 90;
            const rawRadOriginal = (rawDegOriginal * Math.PI) / 180;
            const rawRadOverlapped = (rawDegOverlapped * Math.PI) / 180;

            // 2) compensa a rotação do zodíaco (transforma em ângulo final)
            const rotRad = (zodiacRotation * Math.PI) / 180;
            const angleRadOriginal = rawRadOriginal - rotRad;
            const angleRadOverlapped = rawRadOverlapped - rotRad;

            // 3) offsets de sobreposição
            // const rSymbol = radius - symbolOffset;
            const rSymbol = outerZodiacRadius + overlapData.offset;
            const rLineStart = outerZodiacRadius + lineStartOffset;
            const rLineEnd = outerZodiacRadius;

            // 4) cálculos das coordenadas
            const xAnts = rSymbol * Math.cos(angleRadOverlapped);
            const yAnts = rSymbol * Math.sin(angleRadOverlapped);

            const xAnt1 = rLineStart * Math.cos(angleRadOriginal);
            const yAnt1 = rLineStart * Math.sin(angleRadOriginal);
            const xAnt2 = rLineEnd * Math.cos(angleRadOriginal);
            const yAnt2 = rLineEnd * Math.sin(angleRadOriginal);

            // 5) desenha a linha
            baseGroup
              .append("line")
              .attr("x1", xAnt1)
              .attr("y1", yAnt1)
              .attr("x2", xAnt2)
              .attr("y2", yAnt2)
              .attr("stroke", "#778397") // antiscion color
              .attr("stroke-width", 1);

            // 6) desenha o ícone do planeta
            const iconAntSrc = getPlanetImagePath(planet.type, {
              isAntiscion: true,
              isRetrograde: planet.isRetrograde,
            });

            baseGroup
              .append("image")
              .attr("href", iconAntSrc) // no D3 v6+ use 'href'
              .attr("width", iconSize)
              .attr("height", iconSize)
              .attr("x", xAnts - iconSize / 2)
              .attr("y", yAnts - iconSize / 2);

            const planetName = t(`planets.${planet.type}`);
            const content = makePlanetTooltip({
              label: `${planetName} (${outerInitial}) Antiscion`,
              longitude: planet.antiscion,
              planetType: planet.type,
              isAntiscion: true,
              isRetrograde: planet.isRetrograde
            });

            baseGroup
              .append("rect") // área de hit invisível, mais fácil de clicar que image
              .attr("x", xAnts - iconSize / 2 - 4)
              .attr("y", yAnts - iconSize / 2 - 4)
              .attr("width", iconSize + 8)
              .attr("height", iconSize + 8)
              .attr("fill", "transparent")
              .on(isMobile ? "click" : "mouseover", (event: MouseEvent) => {
                showTooltip(event, content);
              })
              .on("mouseout", () => {
                if (!isMobile) hideTooltip();
              });

            const planetHit = baseGroup
              .append("rect") // invisible hit area, easier to click than the image
              .attr("x", xAnts - iconSize / 2 - 4)
              .attr("y", yAnts - iconSize / 2 - 4)
              .attr("width", iconSize + 8)
              .attr("height", iconSize + 8)
              .attr("fill", "transparent");

            bindPlanetHit(planetHit, {
              xs: xAnts,
              ys: yAnts ,
              iconSize,
              iconSrc: iconAntSrc,
              content,
              tick: { x1: xAnt1, y1: yAnt1, x2: xAnt2, y2: yAnt2 },
            });

            chartElementsForAspect.current = [
              ...chartElementsForAspect.current,
              chartElementAntiscion,
            ];
          }
        }
      });
    }

    if (showOuterChart && showArabicParts && outerArabicParts) {
      arabicPartKeys.forEach((key) => {
        const isCustomArabicPart = customArabicPart 
          && outerArabicParts[key]?.partKey === customArabicPart.partKey 
          && customArabicPart.isFromOuterChart;
        const lot = isCustomArabicPart ? customArabicPart : outerArabicParts[key]!;

        if ((lot !== undefined && lot.planet) || isCustomArabicPart) {
          const outerLotChartElement: ChartElement = {
            id: chartElementsForAspect.current.length,
            isAntiscion: false,
            longitude: lot.longitude,
            name: `${fixedNames.outerKeyPrefix}-${lot.partKey}`,
            elementType: "arabicPart",
            isFromOuterChart: true,
            isRetrograde: false,
          };

          let canDrawArabicPart = true;
          if(hasIsolatedAspect)
            canDrawArabicPart = elementIsInIsolatedAspect(outerLotChartElement);

          if(canDrawArabicPart) {
            const overlapData =
              getElementOverlapLongitudeAndOffset(outerLotChartElement);
  
            // 1) ângulo zodiacal original (graus → rad)
            const rawDegOriginal = 180 - (lot.longitude % 360) - 90;
            const rawDegOverlapped = 180 - (overlapData.longitude % 360) - 90;
            const rawRadOriginal = (rawDegOriginal * Math.PI) / 180;
            const rawRadOverlapped = (rawDegOverlapped * Math.PI) / 180;
  
            // 2) compensa a rotação do zodíaco (transforma em ângulo final)
            const rotRad = (zodiacRotation * Math.PI) / 180;
            const angleRadOriginal = rawRadOriginal - rotRad;
            const angleRadOverlapped = rawRadOverlapped - rotRad;
  
            // 3) offsets de sobreposição
            // const rSymbol = outerZodiacRadius - symbolOffset;
            const rSymbol = outerZodiacRadius + overlapData.offset;
            const rLineStart = outerZodiacRadius + lineStartOffset;
            const rLineEnd = outerZodiacRadius;
  
            // 4) cálculos das coordenadas
            const xs = rSymbol * Math.cos(angleRadOverlapped);
            const ys = rSymbol * Math.sin(angleRadOverlapped);
  
            const x1 = rLineStart * Math.cos(angleRadOriginal);
            const y1 = rLineStart * Math.sin(angleRadOriginal);
            const x2 = rLineEnd * Math.cos(angleRadOriginal);
            const y2 = rLineEnd * Math.sin(angleRadOriginal);
  
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
            const iconSrc = `/planets/${!isCustomArabicPart ? key : "custom-lot"}.png`;
  
            baseGroup
              .append("image")
              .attr("href", iconSrc) // no D3 v6+ use 'href'
              .attr("width", iconSize)
              .attr("height", iconSize)
              // centraliza o ícone em (xs, ys)
              .attr("x", xs - iconSize / 2)
              .attr("y", ys - iconSize / 2);
  
            const content = makeArabicPartTooltip(lot, {isAntiscion: false, isOuterChart: true});
  
            baseGroup
              .append("rect")
              .attr("x", xs - iconSize / 2 - 4)
              .attr("y", ys - iconSize / 2 - 4)
              .attr("width", iconSize + 8)
              .attr("height", iconSize + 8)
              .attr("fill", "transparent")
              .on(isMobile ? "click" : "mouseover", (event: MouseEvent) => {
                showTooltip(event, content);
              })
              .on("mouseout", () => {
                if (!isMobile) hideTooltip();
              });

            const planetHit = baseGroup
              .append("rect") // invisible hit area, easier to click than the image
              .attr("x", xs - iconSize / 2 - 4)
              .attr("y", ys - iconSize / 2 - 4)
              .attr("width", iconSize + 8)
              .attr("height", iconSize + 8)
              .attr("fill", "transparent");

            bindPlanetHit(planetHit, {
              xs,
              ys,
              iconSize,
              iconSrc,
              content,
              tick: { x1, y1, x2, y2 },
            });
            chartElementsForAspect.current = [
              ...chartElementsForAspect.current,
              outerLotChartElement,
            ];
          }
        }
      });
    }

    if (showOuterChart && showArabicPartsAntiscia && outerArabicParts) {
      arabicPartKeys.forEach((key) => {
        const isCustomArabicPart = customArabicPart 
          && outerArabicParts[key]?.partKey === customArabicPart.partKey 
          && customArabicPart.isFromOuterChart;
        const lot = isCustomArabicPart ? customArabicPart : outerArabicParts[key]!;

        if ((lot !== undefined && lot.planet) || isCustomArabicPart) {
          const outerLotChartElementAntiscion: ChartElement = {
            id: chartElementsForAspect.current.length,
            isAntiscion: true,
            longitude: lot.antiscion,
            name: `${fixedNames.outerKeyPrefix}-${lot.partKey}-${fixedNames.antiscionName}`,
            elementType: "arabicPart",
            isFromOuterChart: true,
            isRetrograde: false,
            isTransit: true,
          };

          let canDrawArabicPart = true;
          if(hasIsolatedAspect)
            canDrawArabicPart = elementIsInIsolatedAspect(outerLotChartElementAntiscion);

          if(canDrawArabicPart) {

            const overlapData = getElementOverlapLongitudeAndOffset(
              outerLotChartElementAntiscion
            );
  
            // 1) ângulo zodiacal original (graus → rad)
            const rawDegOriginal = 180 - (lot.antiscion % 360) - 90;
            const rawDegOverlapped = 180 - (overlapData.longitude % 360) - 90;
            const rawRadOriginal = (rawDegOriginal * Math.PI) / 180;
            const rawRadOverlapped = (rawDegOverlapped * Math.PI) / 180;
  
            // 2) compensa a rotação do zodíaco (transforma em ângulo final)
            const rotRad = (zodiacRotation * Math.PI) / 180;
            const angleRadOriginal = rawRadOriginal - rotRad;
            const angleRadOverlapped = rawRadOverlapped - rotRad;
  
            // 3) offsets de sobreposição
            // const rSymbol = radius - symbolOffset;
            const rSymbol = outerZodiacRadius + overlapData.offset;
            const rLineStart = outerZodiacRadius + lineStartOffset;
            const rLineEnd = outerZodiacRadius;
  
            // 4) cálculos das coordenadas
            const xs = rSymbol * Math.cos(angleRadOverlapped);
            const ys = rSymbol * Math.sin(angleRadOverlapped);
  
            const x1 = rLineStart * Math.cos(angleRadOriginal);
            const y1 = rLineStart * Math.sin(angleRadOriginal);
            const x2 = rLineEnd * Math.cos(angleRadOriginal);
            const y2 = rLineEnd * Math.sin(angleRadOriginal);
  
            // 5) desenha a linha
            baseGroup
              .append("line")
              .attr("x1", x1)
              .attr("y1", y1)
              .attr("x2", x2)
              .attr("y2", y2)
              .attr("stroke", "#778397") // antiscion color
              .attr("stroke-width", 1);
  
            // 6) desenha o ícone do planeta
            const iconSize = 13; // px
            // const iconSrc = `/planets/antiscion/${key}.png`;
            const iconSrc = `/planets/antiscion/${!isCustomArabicPart ? key : "custom-lot"}.png`;
  
            baseGroup
              .append("image")
              .attr("href", iconSrc) // no D3 v6+ use 'href'
              .attr("width", iconSize)
              .attr("height", iconSize)
              // centraliza o ícone em (xs, ys)
              .attr("x", xs - iconSize / 2)
              .attr("y", ys - iconSize / 2);
  
            const content = makeArabicPartTooltip(lot, {isAntiscion: true, isOuterChart: true});
  
            baseGroup
              .append("rect")
              .attr("x", xs - iconSize / 2 - 4)
              .attr("y", ys - iconSize / 2 - 4)
              .attr("width", iconSize + 8)
              .attr("height", iconSize + 8)
              .attr("fill", "transparent")
              .on(isMobile ? "click" : "mouseover", (event: MouseEvent) => {
                showTooltip(event, content);
              })
              .on("mouseout", () => {
                if (!isMobile) hideTooltip();
              });
  
            const planetHit = baseGroup
              .append("rect") // invisible hit area, easier to click than the image
              .attr("x", xs - iconSize / 2 - 4)
              .attr("y", ys - iconSize / 2 - 4)
              .attr("width", iconSize + 8)
              .attr("height", iconSize + 8)
              .attr("fill", "transparent");

            bindPlanetHit(planetHit, {
              xs,
              ys,
              iconSize,
              iconSrc,
              content,
              tick: { x1, y1, x2, y2 },
            });

            chartElementsForAspect.current = [
              ...chartElementsForAspect.current,
              outerLotChartElementAntiscion,
            ];
          }
        }
      });
    }

    // Desenha as cúspide das casas do mapa externo
    if (showOuterChart && outerHouses) {
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

        // Hit area + tooltip da casa
        const houseContent = makeHouseTooltip(j, decimalToDegreesMinutes(cuspsOuter[j]));
        centerCircles
          .append("rect")
          .attr("x", x - 12)
          .attr("y", y - 12)
          .attr("width", 24)
          .attr("height", 24)
          .attr("fill", "transparent")
          .on(isMobile ? "click" : "mouseover", (event: MouseEvent) => {
            showTooltip(event, houseContent);
          })
          .on("mouseout", () => {
            if (!isMobile) hideTooltip();
          });

        centerCircles
          .append("text")
          .attr("x", x)
          .attr("y", y)
          .attr("font-size", 10)
          .attr("text-anchor", "middle")
          .attr("font-weight", showOuterChart && j % 3 === 0 ? "bold" : "plain")
          .attr("alignment-baseline", "middle")
          .text(txt)
          .on(isMobile ? "click" : "mouseover", (event: MouseEvent) => {
            showTooltip(event, houseContent);
          })
          .on("mouseout", () => {
            if (!isMobile) hideTooltip();
          });

        chartElementsForAspect.current = [
          ...chartElementsForAspect.current,
          {
            id: chartElementsForAspect.current.length,
            isAntiscion: false,
            longitude: decimalToDegreesMinutes(startDeg),
            name: `${fixedNames.outerKeyPrefix}-${fixedNames.houseName}-${j}`,
            elementType: "house",
            isFromOuterChart: true,
            isRetrograde: false,
            isTransit: false,
        }]
      }
    }   

    drawAspects(chartElementsForAspect.current, {
      baseGroup: aspectsLayer,
      radius: smallInnerRadius,
      lineStartOffset,
    });    

    setTimeout(() => {
      updateIsMountingChart(false);
    }, 100);
  }, [
    planets,
    housesData,
    showArabicParts,
    showPlanetsAntiscia,
    showArabicPartsAntiscia,
    testValue,
    showOuterChart,
    showDegrees,
    hasIsolatedAspect,
    useDecans,
    useTerms,
    currentTerms,    
    customArabicPart,
    showTransSaturnians,
    scaleFactor,
  ]);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        hideTooltip();
      }
    }
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (!baseGroupRef.current) return;

    // Limpa estrelas e tooltips desenhadas anteriormente, sempre,
    // antes de decidir se desenha de novo ou não.
    baseGroupRef.current.selectAll(".fixed-star-icon").remove();
    baseGroupRef.current.selectAll(".fixed-star-hit").remove();

    if (!showFixedStars) return;

    fixedStarsAspects
    .filter((asp) => asp.aspectedElement.isRelevant ? showEssentialFixedStars : showSecondaryFixedStars)
    .forEach((asp) => {
      // 1) ângulo zodiacal original (graus → rad)
      const rawDeg = 180 - (asp.aspectedElement.longitude % 360) - 90;
      const rawRad = (rawDeg * Math.PI) / 180;

      // 2) compensa a rotação do zodíaco (transforma em ângulo final)
      const rotRad = (zodiacRotation * Math.PI) / 180;
      const angleRad = rawRad - rotRad;

      const starOffset = symbolOffset - 12;
      const rSymbol = radius + starOffset;

      // 4) cálculos das coordenadas FINAIS
      const xs = rSymbol * Math.cos(angleRad);
      const ys = rSymbol * Math.sin(angleRad);

      // 5) desenha o ícone da estrela
      const iconSize = 9; // px
      const iconSrc = asp.aspectedElement.isRelevant ?  "/relevant-star.png" :  "/star-1.png";
      const opacity = asp.aspectedElement.isRelevant ? 1 : 0.4;

      baseGroupRef.current
        ?.append("image")
        .attr("class", "fixed-star-icon")
        .attr("href", iconSrc)
        .attr("width", iconSize)
        .attr("height", iconSize)
        .attr("x", xs - iconSize / 2)
        .attr("y", ys - iconSize / 2)
        .attr("opacity", opacity);

      const starContent = makeFixedStarTooltip(asp.aspectedElement);

      baseGroupRef.current
        ?.append("rect")
        .attr("class", "fixed-star-hit")
        .attr("x", xs - iconSize / 2 - 4)
        .attr("y", ys - iconSize / 2 - 4)
        .attr("width", iconSize + 8)
        .attr("height", iconSize + 8)
        .attr("fill", "transparent")
        .on(isMobile ? "click" : "mouseover", (event: MouseEvent) => {
          showTooltip(event, starContent);
        })
        .on("mouseout", () => {
          if (!isMobile) hideTooltip();
        });
    });
  }, [fixedStarsAspects, showFixedStars, showEssentialFixedStars, showSecondaryFixedStars]);

  useEffect(() => {
    if (!aspects || !aspects.every(a => a.aspectImg !== undefined)) return;
    if (!baseGroupRef.current) return;

    baseGroupRef.current.selectAll(".aspect-hit").remove();

    const aspectsData: PlanetAspectData[] = !hasIsolatedAspect ? aspects : [...aspects.filter(asp => asp.key === selectedAspect!.key)];
    aspectsData.forEach(aspect => {
      const coords = aspectStrokeCoords.current.get(aspect.key);
      if (!coords) return; // linha não foi desenhada (ex: aspecto com casa)

      const { x1, y1, x2, y2 } = coords;
      const tooltipContent = makeAspectTooltip(aspect);

      if (isMobile) {
        // Mobile: tap abre tooltip; segundo tap no mesmo aspecto isola
        baseGroupRef.current!
          .append("line")
          .attr("class", `aspect-hit aspect-hit-${aspect.key}`)
          .attr("data-aspect-key", aspect.key)
          .attr("x1", x1).attr("y1", y1)
          .attr("x2", x2).attr("y2", y2)
          .attr("stroke", "transparent")
          .attr("stroke-width", 10)
          .on("click", (event: MouseEvent) => {
            event.stopPropagation();
            // const isAlreadySelected = selectedAspectRef.current?.key === aspect.key;
            const isAlreadySelected = selectedAspect?.key === aspect.key;
            if (isAlreadySelected) {
              // segundo tap: isola
              // selectedAspectRef.current = null;
              setSelectedAspect(null);
              setHasIsolatedAspect(false);
              hideTooltip();
            } else {
              // primeiro tap: mostra tooltip e marca como selecionado
              // selectedAspectRef.current = aspect;
              setSelectedAspect(aspect);
              setHasIsolatedAspect(true);
              showTooltip(event, tooltipContent);
            }
          });
      } else {
        // Desktop: hover para tooltip, click para isolar
        baseGroupRef.current!
          .append("line")
          .attr("class", `aspect-hit aspect-hit-${aspect.key}`)
          .attr("data-aspect-key", aspect.key)
          .attr("x1", x1).attr("y1", y1)
          .attr("x2", x2).attr("y2", y2)
          .attr("stroke", "transparent")
          .attr("stroke-width", 10)
          .attr("cursor", "pointer")
          .on("mouseover", (event: MouseEvent) => {
            showTooltip(event, tooltipContent);
          })
          .on("mouseout", () => {
            hideTooltip();
          })
          .on("click", (event: MouseEvent) => {
            event.stopPropagation();
            // const isAlreadySelected = selectedAspectRef.current?.key === aspect.key;
            const isAlreadySelected = selectedAspect?.key === aspect.key;
            const next = isAlreadySelected ? null : aspect;
            // selectedAspectRef.current = next;
            setSelectedAspect(next);
            setHasIsolatedAspect(next !== null);
            // console.log(`isolated aspect: ${(next !== null).toString()}`);
            // console.log(`aspect is`);
            // console.log(selectedAspectRef.current);
          });
      }
    });
  }, [aspects, hasIsolatedAspect]);  

  const tooltipElRef = useRef<HTMLDivElement>(null);

  const getTooltipStyle = (data: TooltipData): React.CSSProperties => ({
    left: data.x,
    top: data.anchor.bottomY, // refined by the layout effect (centering + viewport clamp)
  });

  // Pinned tooltip: center it under the planet, then keep it inside the viewport.
  // Runs before paint, so there is no visible jump.
  useLayoutEffect(() => {
    const el = tooltipElRef.current;
    const container = containerRef.current;
    if (!tooltip?.anchor || !el || !container) return;

    const margin = TOOLTIP_VIEWPORT_MARGIN;
    const containerRect = container.getBoundingClientRect();
    const { width, height } = el.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight;

    // Horizontal: centered on the planet, clamped to the viewport
    const desiredLeft = containerRect.left + tooltip.x - width / 2;
    const maxLeft = Math.max(margin, viewportWidth - width - margin);
    const left = Math.min(Math.max(desiredLeft, margin), maxLeft);

    // Vertical: below the planet. Safety net: flip above only if it does not fit
    // below the viewport but does fit above the planet.
    let top = tooltip.anchor.bottomY;
    const overflowsBottom = containerRect.top + top + height > viewportHeight - margin;
    const fitsAbove = containerRect.top + tooltip.anchor.topY - height >= margin;
    if (overflowsBottom && fitsAbove) top = tooltip.anchor.topY - height;

    el.style.left = `${left - containerRect.left}px`;
    el.style.top = `${top}px`;
  }, [tooltip]);

  // Define o deslocamento extra a partir do centro (em px), por contexto
  let offsetX = 0;
  let offsetY = 0;

  if (!isMobileBreakPoint()) {
    if (isReturnChart()) {
      offsetX = 0; // ajustar
      offsetY = 0;
    }
    if (isSinastryChart()) {
      offsetX = 0;
      offsetY = 0;
    }
    if (isProgressionChart() || isProfectionChart()) {
      offsetX = 0;
      offsetY = 0;
    }
  } else {
    offsetX = 0; // ajustar
    offsetY = 0;

    if (isCombinedWithBirthChart || isCombinedWithReturnChart) {
      offsetX = 0;
      offsetY = 0;
    }
    if (isSinastryChart()) {
      offsetX = 0;
      offsetY = 0;
    }
    if (isProgressionChart()) {
      offsetX = 0;
      offsetY = 0;
    }
  }

  const getMobileHeight = () => {
    // if(!useDecans && !useTerms)
    //   return 'h-[22rem]'
    // else if((useDecans && !useTerms) || (!useDecans && useTerms))
    //   return 'h-[22rem]'
    // else if(useDecans && useTerms)
    //   return 'h-[22rem]'

    if(chartMenu === "sinastry")
      return 'h-[21rem]';

    if(chartMenu === "profection")
      return "h-[24rem]";

    return useReturnSelectorArrows? "h-[24rem]" : 'h-[21rem]';
  }
  
  const getMobileDateBlockPosition = () => {
    if(chartMenu === "birth")
      return !useReturnSelectorArrows ? 'mt-[-15px]' : 'top-88';
    else if(chartMenu === "solarReturn" || chartMenu === "lunarReturn" || 
      chartMenu === "lunarDerivedReturn" || chartMenu === "progression") 
      return 'bottom-[-5px]';
    else if(chartMenu === "sinastry")
      return 'mt-[-20px]';
    else if(chartMenu === "transits" )
      return 'top-86';
    else if(chartMenu === "moment")
      return 'top-88';
    else if(chartMenu === "profection")
      return 'bottom-[-5px]';
  }

  const getDesktopHeight = () => {
    if (isZoomed) return 'h-full';

    if(!useDecans && !useTerms)
      return showOuterChart? 'md:h-[40rem]' : 'md:h-[42rem]'

    if((useDecans && !useTerms) || (!useDecans && useTerms))
      return showOuterChart? 'md:h-[42rem]' : 'md:h-[44rem]'

    if(useDecans && useTerms)
      return showOuterChart? 'md:h-[44rem]' : 'md:h-[46rem]'
  }

  return (
    <div
      className={`w-full flex flex-col justify-center items-center gap-8 mb-4 md:mb-0
        ${isZoomed ? "h-full" : useReturnSelectorArrows ? 'mx-14' : 'mx-10'}`}
    >
      {useReturnSelectorArrows && !isZoomed ? (
        <ReturnSelectorArrows showAdvanceOptions={showAdvanceOptions}>
          <div
            ref={containerRef}
            className={`relative w-full ${isZoomed ? "h-full" : `${getMobileHeight()} ${getDesktopHeight()}`} ${(isMountingChart ? "opacity-0" : "")}`}
            onClick={(e) => {
              if (e.target === containerRef.current) hideTooltip();
            }}
          >
            <svg
              ref={ref}
              style={{
                position: "absolute",
                left: `calc(50% + ${offsetX}px)`,
                top: `calc(${isMobile ? '46%' : '50%'} + ${offsetY}px)`,
                transform: "translate(-50%, -50%)",
              }}
            />

            {isMobileBreakPoint() && dateBlocks &&
              <div className={`absolute w-full ${getMobileDateBlockPosition()}`}>
                <ChartHeaderSubtitle blocks={dateBlocks}/>
              </div>
            }

            {/* {tooltip && showDegrees && (
              <div
                className="absolute z-50 pointer-events-none px-2 py-1 rounded text-sm bg-white border border-zinc-200 shadow-md w-max max-w-[350px]"
                style={{ left: tooltip.x + 10, top: tooltip.y - 28 }}
              >
                {tooltip.content}
              </div>
            )} */}
            {tooltip && showDegrees && (
              <div
                ref={tooltipElRef}
                className="absolute z-50 pointer-events-none px-2 py-1 rounded text-sm bg-white border border-zinc-200 shadow-md w-max max-w-[min(350px,calc(100vw-1rem))]"
                style={getTooltipStyle(tooltip)}
              >
                {tooltip.content}
              </div>
            )}
          </div>
        </ReturnSelectorArrows>
      ) : (
        <div
          ref={containerRef}
          className={`relative w-full ${isZoomed ? "h-full" : `${getMobileHeight()} ${getDesktopHeight()}`} ${(isMountingChart ? "opacity-0" : "")}`}
          onClick={(e) => {
            if (e.target === containerRef.current) hideTooltip();
          }}
        >
          <svg
            ref={ref}
            style={{
              position: "absolute",
              left: `calc(50% + ${offsetX}px)`,
               top: `calc(${isMobile ? '51%' : '50%'} + ${offsetY}px)`,
              transform: "translate(-50%, -50%)",
            }}
          />

          {/* {tooltip && showDegrees && (
            <div
              className="absolute z-50 pointer-events-none px-2 py-1 rounded text-sm bg-white border border-zinc-200 shadow-md w-max max-w-[350px]"
              style={{ left: tooltip.x + 10, top: tooltip.y - 28 }}
            >
              {tooltip.content}
            </div>
          )} */}
          {tooltip && showDegrees && (
            <div
              ref={tooltipElRef}
              className="absolute z-50 pointer-events-none px-2 py-1 rounded text-sm bg-white border border-zinc-200 shadow-md w-max max-w-[min(350px,calc(100vw-1rem))]"
              style={getTooltipStyle(tooltip)}
            >
              {tooltip.content}
            </div>
          )}
        </div>
      )}  

      {!useReturnSelectorArrows && isMobileBreakPoint() && dateBlocks &&
        <div className={`h-min w-full ${getMobileDateBlockPosition()}`}>
          <ChartHeaderSubtitle blocks={dateBlocks}/>
        </div>
      }    
    </div>
  );
};

export default AstroChart;
