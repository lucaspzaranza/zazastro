"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import {
  angularLabels,
  arabicPartKeys,
  decimalToDegreesMinutes,
  fixedNames,
  getDegreesInsideASign,
  getSign,
  mod360,
  signsGlpyphs,
} from "../../utils/chartUtils";
import { FixedStar } from "@/interfaces/BirthChartInterfaces";
import {
  Aspect,
  AspectedElement,
  AstroChartProps,
  ChartElement,
  ChartElementOverlap,
  ElementOverlapLongitudeAndOffset,
  ElementOverlapPosition,
  OrbCalculationOrientation,
  PlanetAspectData,
} from "@/interfaces/AstroChartInterfaces";
import AstroChartMenu from "../menus/AstroChartMenu";

const ASPECTS: Aspect[] = [
  { type: "conjunction", angle: 0 },
  { type: "sextile", angle: 60 },
  { type: "square", angle: 90 },
  { type: "trine", angle: 120 },
  { type: "opposition", angle: 180 },
];

const AstroChart: React.FC<AstroChartProps> = ({ props }) => {
  const {
    planets,
    housesData,
    arabicParts,
    outerPlanets,
    outerHouses,
    outerArabicParts,
    fixedStars,
    combineWithBirthChart,
    combineWithReturnChart,
    onUpdateAspectsData,
  } = { ...props };

  const ref = useRef<SVGSVGElement>(null);
  const [testValue] = useState(2.5);
  const [showArabicParts, setShowArabicParts] = useState(false);
  const [showPlanetsAntiscia, setShowPlanetsAntiscia] = useState(false);
  const [showArabicPartsAntiscia, setShowArabicPartsAntiscia] = useState(false);
  const [showOuterchart] = useState(
    outerPlanets !== undefined && outerHouses !== undefined
  );
  const [fixedStarsAspects, setFixedStarAspects] = useState<PlanetAspectData[]>(
    []
  );
  const symbolOffset = 16;

  /**
   * Range for limit detection at overlap functions.
   */
  const overlapRange = 4; // degrees.

  /**
   * Maximum distance to consider an element step inward to center
   * and be above other chart element.
   */
  const inwardZoneRadius = 2.5;
  const chartElementsForAspect = useRef<ChartElement[]>([]);
  let overlapElements: ChartElementOverlap[] = [];

  const [screenDimensions, setScreenDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  // const size = 200; // default: 400
  const size = screenDimensions.width > 600 ? 400 : 370;
  const scaleFactor =
    screenDimensions.width > 600
      ? showOuterchart
        ? 1.25
        : 1.5
      : showOuterchart
      ? 0.85
      : 1;
  const scaledSize = size * scaleFactor;
  const center = size / 2;
  const radius = size / 2 - 40;
  const zodiacRadius = radius + 20;
  const outerZodiacRadius = zodiacRadius + 10;
  const outerChartBorderRadius = outerZodiacRadius + 60;
  const baseGroupRef =
    useRef<d3.Selection<SVGGElement, unknown, null, undefined>>(undefined);

  const getHouseDataAscendant = () => housesData?.ascendant ?? 0;

  const zodiacRotation = 270 - getHouseDataAscendant();

  // const svgRef = useRef<SVGSVGElement | null>(null);
  // const groupRef = useRef<SVGGElement | null>(null);

  function getOverlapElement(chartElement: ChartElement): ChartElementOverlap {
    return overlapElements.find(
      (overlap) => overlap.element.id === chartElement.id
    )!;
  }

  function getOverlappedElementsForChartElement(
    chartElement: ChartElement
  ): ChartElement[] {
    // if (chartElement.planetType === "neptune" && chartElement.isAntiscion) {
    //   console.log(
    //     "snapshot",
    //     Array.isArray(chartElementsForAspect.current)
    //       ? [...chartElementsForAspect.current]
    //       : JSON.parse(JSON.stringify(chartElementsForAspect.current))
    //   );
    // }

    return chartElementsForAspect.current.filter((e) => {
      if (chartElement.isFromOuterChart && !e.isFromOuterChart) return false;
      if (!chartElement.isFromOuterChart && e.isFromOuterChart) return false;

      const upperLimit = chartElement.longitude + overlapRange;
      let lowerLimit = chartElement.longitude - overlapRange;

      let chartElementLong = chartElement.longitude;
      let elementLong = e.longitude;

      if (upperLimit > 360 && elementLong < 30) {
        elementLong = elementLong + 360;
      } else if (lowerLimit < 0 && elementLong >= 330) {
        chartElementLong = chartElementLong + 360;
        lowerLimit = lowerLimit + 360;
      }

      if (elementLong < chartElementLong) {
        return elementLong >= lowerLimit;
      } else if (elementLong > chartElementLong) {
        return elementLong <= upperLimit;
      } else if (elementLong === chartElementLong) {
        return true;
      }
    });
  }

  function getNearestElement(
    chartElement: ChartElement,
    overlappedElements: ChartElement[]
  ) {
    return overlappedElements.reduce((prev, curr) => {
      const prevDiff = Math.abs(prev.longitude - chartElement.longitude);
      const currDiff = Math.abs(curr.longitude - chartElement.longitude);
      return currDiff < prevDiff ? curr : prev;
    });
  }

  function updateOverlapElementsArray(
    newElement: ChartElementOverlap,
    belowElement?: ChartElementOverlap
  ) {
    let belowIndex = -1;

    if (belowElement) {
      belowIndex = overlapElements.indexOf(belowElement);
    }

    const filteredArray = overlapElements.map((el, index) => {
      if (index === belowIndex) return belowElement;
      else return el;
    });

    filteredArray.push(newElement);

    overlapElements = filteredArray.map((el) => ({ ...el! }));
  }

  function getAboveOverlapElementOffset(
    belowElement: ChartElementOverlap | undefined
  ): number {
    if (!belowElement) return symbolOffset;

    const offsetMultiplicator = belowElement.inwardIndex + 1;
    const offset = symbolOffset * offsetMultiplicator;
    return offset;
  }

  function nearestElementIsBelowCurrentElement(
    currentElement: ChartElement,
    currentInwardIndex: number,
    nearestElementOverlapData?: ChartElementOverlap
  ): boolean {
    if (!nearestElementOverlapData) return false;

    const distance = Math.abs(
      nearestElementOverlapData.element.longitude - currentElement.longitude
    );
    return (
      nearestElementOverlapData.position !== "inward" &&
      distance < inwardZoneRadius
    );
  }

  function deepEqual(a: any, b: any): boolean {
    if (a === b) return true;

    if (
      typeof a !== "object" ||
      typeof b !== "object" ||
      a === null ||
      b === null
    ) {
      return false;
    }

    // Arrays
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((val, i) => deepEqual(val, b[i]));
    }

    // Objetos
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    return keysA.every((key) => deepEqual(a[key], b[key]));
  }

  function getElementOverlapLongitudeAndOffset(
    originalChartElement: ChartElement
  ): ElementOverlapLongitudeAndOffset {
    let chartElement = originalChartElement;
    const longitudeOffset = 2.5;

    let longitude = chartElement.longitude;
    let offset = symbolOffset;
    const initialOffset = offset;
    let position: ElementOverlapPosition = "origin";
    let belowElement: ChartElementOverlap | undefined;
    let inwardIndex = 1;
    let loopCount = 0;

    let overlappedElements = getOverlappedElementsForChartElement(chartElement);
    let previousLoopElements = [...overlappedElements];

    while (overlappedElements.length > 0) {
      const elementsFurtherBack = overlappedElements.filter(
        (o) => o.longitude <= chartElement.longitude
      );

      const elementsFurtherAhead = overlappedElements.filter(
        (o) => o.longitude > chartElement.longitude
      );

      const nearestElement = getNearestElement(
        chartElement,
        overlappedElements
      );
      const nearestOverlapData = getOverlapElement(nearestElement);
      const nearestElIsBelowCurrentEl = nearestElementIsBelowCurrentElement(
        chartElement,
        inwardIndex,
        nearestOverlapData
      );

      belowElement = nearestElIsBelowCurrentEl ? nearestOverlapData : undefined;
      if (loopCount === 0) {
        offset = getAboveOverlapElementOffset(belowElement);
      } else {
        offset = symbolOffset * (nearestOverlapData?.inwardIndex ?? 1);
      }

      const distance = Math.abs(
        // nearestElement.longitude - chartElement.longitude
        nearestOverlapData.element.longitude - chartElement.longitude
      );

      // has elements on both sides
      if (elementsFurtherBack.length > 0 && elementsFurtherAhead.length > 0) {
        // It advances the offset only if the inward hasn't already been made previously at
        // getAboveOverlapElementOffset function, i.e: the sum will be different the initialOffset.
        // If it's equals, it means the offset was already been altered once.
        if (initialOffset + symbolOffset !== offset) {
          if (nearestOverlapData.inwardIndex === 1) {
            offset = offset + symbolOffset; // advance one step
          } else {
            offset = Math.max(
              symbolOffset * (nearestOverlapData.inwardIndex - 1),
              symbolOffset
            );
          }
        }

        if (position === "inward" && distance < inwardZoneRadius) {
          offset = offset + symbolOffset;
        }

        position = "inward";
        inwardIndex = belowElement
          ? belowElement.inwardIndex + 1
          : inwardIndex + 1;
      } else {
        // has elements at only one side

        let chartElementLong = chartElement.longitude;
        // let nearestElementLong = nearestElement.longitude;
        let nearestElementLong = nearestOverlapData.element.longitude;

        const upperLimit = chartElementLong + overlapRange;
        const lowerLimit = chartElementLong - overlapRange;

        if (upperLimit > 360 && nearestElementLong < 30) {
          nearestElementLong = nearestElementLong + 360;
        } else if (lowerLimit < 0 && nearestElementLong >= 330) {
          chartElementLong = chartElementLong + 360;
        }

        if (nearestElIsBelowCurrentEl) {
          position = "inward";

          if (loopCount > 0) {
            if (nearestOverlapData.inwardIndex === inwardIndex) {
              longitude = originalChartElement.longitude;
            }
            offset += symbolOffset;
          }
          inwardIndex = belowElement ? belowElement.inwardIndex + 1 : 1;
        } else if (
          nearestOverlapData?.position !== "inward" &&
          position !== "inward"
          // everybody at the origin index
        ) {
          if (distance > inwardZoneRadius) {
            if (nearestElementLong <= chartElementLong) {
              position = "forward";
              longitude = mod360(longitude + longitudeOffset);
            } else if (nearestElementLong > chartElementLong) {
              position = "backward";
              longitude = mod360(longitude - longitudeOffset);
            }
          } else {
            position = "inward";
            inwardIndex = belowElement ? belowElement.inwardIndex + 1 : 1;
          }
        } else if (position === "inward") {
          if (nearestElementLong <= chartElementLong) {
            longitude = mod360(longitude + longitudeOffset);
          } else if (nearestElementLong > chartElementLong) {
            longitude = mod360(longitude - longitudeOffset);
          }
        } else if (
          deepEqual(
            nearestOverlapData.aboveElement?.element,
            originalChartElement
          )
        ) {
          position = "inward";
          inwardIndex = nearestOverlapData
            ? nearestOverlapData.inwardIndex + 1
            : 1;
          offset = symbolOffset * inwardIndex;
        }
      }

      chartElement = {
        ...chartElement,
        longitude,
      };

      if (chartElement.longitude === originalChartElement.longitude) {
        overlappedElements = overlappedElements.filter((el) => {
          const overlapElData = getOverlapElement(el);
          return (
            el.id !== nearestElement.id && overlapElData?.position === position
          );
        });
      } else {
        overlappedElements = getOverlappedElementsForChartElement(chartElement);
      }

      if (deepEqual(overlappedElements, previousLoopElements)) {
        // console.log(
        //   "mudou foi nada, vamo simbora. loopCount: ",
        //   loopCount,
        //   " elemento: ",
        //   originalChartElement.planetType,
        //   " antiscion: ",
        //   originalChartElement.isAntiscion
        // );
        break;
      } else {
        // if (originalChartElement.planetType === "neptune" && loopCount === 10) {
        //   console.log(overlappedElements);
        //   console.log(previousLoopElements);
        // }
      }

      previousLoopElements = [...overlappedElements];
      loopCount++;

      if (loopCount > 10) {
        // console.log(
        //   "too many loops. loopCount: ",
        //   loopCount,
        //   " elemento: ",
        //   originalChartElement.planetType,
        //   " antiscion: ",
        //   originalChartElement.isAntiscion
        // );
        // console.log(overlappedElements);
        // console.log(previousLoopElements);
        break;
      }
    }

    const newOverlapElement: ChartElementOverlap = {
      element: chartElement,
      inwardIndex,
      position,
    };

    if (position === "inward" && belowElement) {
      belowElement = {
        ...belowElement,
        aboveElement: newOverlapElement,
      };
    }

    updateOverlapElementsArray(newOverlapElement, belowElement);

    return {
      longitude,
      offset,
    };
  }

  function isAspectableElement(
    element: ChartElement,
    fixedStarAspect: boolean = false
  ): boolean {
    if (fixedStarAspect && element.isAntiscion) return false;
    if (fixedStarAspect && element.elementType === "arabicPart") return false;

    if (element.elementType === "planet") {
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
    if (element.elementType === "arabicPart") {
      return aspect.type === "conjunction" || aspect.type === "opposition";
    } else if (element.isAntiscion) {
      return aspect.type === "conjunction" || aspect.type === "opposition";
    } else if (element.elementType === "house")
      return aspect.type !== "sextile";

    return true;
  }

  function generateAspectKey(
    element: ChartElement,
    aspectedElement: ChartElement,
    aspect: Aspect
  ): string {
    const elementKey: string =
      (element.isFromOuterChart ? `${fixedNames.outerKeyPrefix}-` : "") +
      (element.planetType ?? element.name)
        .replace(fixedNames.antiscionName, "")
        .replace("-", "");

    const aspectedName =
      aspectedElement.elementType === "fixedStar"
        ? aspectedElement.name.toLowerCase().replace(" ", "-")
        : aspectedElement.name;

    let aspectedElementKey: string =
      (element.isFromOuterChart ? `${fixedNames.outerKeyPrefix}-` : "") +
      (aspectedElement.planetType ?? aspectedName).replace(
        fixedNames.antiscionName,
        ""
      );

    if (aspectedElement.elementType !== "fixedStar") {
      aspectedElementKey = aspectedElementKey.replace("-", "");
    }

    return `${elementKey}-${aspect.type}-${aspectedElementKey}`;
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
      if (fixedStar.magnitude < 3 && fixedStar.magnitude >= 2) return 1.5;
      if (fixedStar.magnitude < 2 && fixedStar.magnitude >= 1) return 2;
      if (fixedStar.magnitude < 1) return 3;
    }

    if (
      (element.elementType === "arabicPart" &&
        aspectedElement.elementType !== "house") ||
      (element.elementType !== "house" &&
        aspectedElement.elementType === "arabicPart")
    )
      // some of them is arabic part and the other isn't house, so may be arabicPart or a planet,
      // so the orb will be only 1 degree
      return 1;
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
              aspectCanBeUsed(elToCheck, aspect) &&
              aspectNotRenderedYet(aspectsData, element, elToCheck, aspect) &&
              aspectElementsAreInProperSigns(element, elToCheck, aspect)
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
                  },
                  aspectedElement: {
                    name: elWithAsp.planetType ?? elWithAsp.name,
                    longitude: elWithAsp.longitude,
                    elementType: elWithAsp.elementType,
                    isFromOuterChart: elWithAsp.isFromOuterChart!,
                    isAntiscion: elWithAsp.isAntiscion,
                    isRetrograde: elWithAsp.isRetrograde,
                  },
                  key: generateAspectKey(element, elWithAsp, aspect),
                });
              }
            });
          }
        }
      });
    });

    // console.log(aspectsData);

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
              },
              aspectedElement: {
                name: star.name,
                longitude: star.longitude,
                elementType: "fixedStar",
                isFromOuterChart: false,
                isAntiscion: false,
                isRetrograde: false,
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
    const aspectsData = getAspects(elements);
    const aspectsWithFixedStars = getAspectsWithFixedStars(elements);
    setFixedStarAspects(aspectsWithFixedStars);
    // console.log(aspectsData);

    onUpdateAspectsData?.([...aspectsData, ...aspectsWithFixedStars]);

    aspectsData.forEach((aspect) => {
      if (!isAspectWithHouse(aspect)) {
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

  useEffect(() => {
    function handleResize() {
      setScreenDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener("resize", handleResize);

    // dispara logo na montagem
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    chartElementsForAspect.current = [];

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

    // Linhas externas de grau (a cada 10°)
    if (!showOuterchart) {
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

    // Desenha os planetas
    const lineStartOffset = 6; // quão “para dentro” a linha começa
    planets?.forEach((planet) => {
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
      const rSymbol = radius - overlapData.offset;
      const rLineStart = radius - lineStartOffset;
      const rLineEnd = radius;

      // 4) cálculos das coordenadas
      const xs = rSymbol * Math.cos(angleRadOverlapped);
      const ys = rSymbol * Math.sin(angleRadOverlapped);

      const x1 = rLineStart * Math.cos(angleRadOriginal);
      const y1 = rLineStart * Math.sin(angleRadOriginal);
      const x2 = rLineEnd * Math.cos(angleRadOriginal);
      const y2 = rLineEnd * Math.sin(angleRadOriginal);

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

      // chartElementsForAspect.current.push(chartElement);
      chartElementsForAspect.current = [
        ...chartElementsForAspect.current,
        chartElement,
      ];

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

        overlapData = getElementOverlapLongitudeAndOffset(antiscionElement);

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
        // const rAntSymbol = radius - symbolOffset;
        const rAntSymbol = radius - overlapData.offset;
        const rAntLineStart = radius - lineStartOffset;
        const AntLineEnd = radius;

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
          .attr("stroke", "#ff914d") // antiscion color
          .attr("stroke-width", 1);

        // 6) desenha o ícone do planeta
        const iconAntSize = 13; // px
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

        // chartElementsForAspect.current.push(antiscionElement);
        chartElementsForAspect.current = [
          ...chartElementsForAspect.current,
          antiscionElement,
        ];
      }
    });

    if (showArabicParts && arabicParts !== undefined) {
      arabicPartKeys.forEach((key) => {
        const lot = arabicParts[key];

        if (lot !== undefined && lot.planet) {
          const lotChartElement: ChartElement = {
            id: chartElementsForAspect.current.length,
            isAntiscion: false,
            longitude: lot.longitude,
            name: lot.partKey,
            elementType: "arabicPart",
            isFromOuterChart: false,
            isRetrograde: false,
          };

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
          const rSymbol = radius - overlapData.offset;
          const rLineStart = radius - lineStartOffset;
          const rLineEnd = radius;

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
          const iconSrc = `/planets/${key}.png`;

          baseGroup
            .append("image")
            .attr("href", iconSrc) // no D3 v6+ use 'href'
            .attr("width", iconSize)
            .attr("height", iconSize)
            // centraliza o ícone em (xs, ys)
            .attr("x", xs - iconSize / 2)
            .attr("y", ys - iconSize / 2);

          // chartElementsForAspect.current.push(lotChartElement);
          chartElementsForAspect.current = [
            ...chartElementsForAspect.current,
            lotChartElement,
          ];
        }
      });
    }

    if (showArabicPartsAntiscia && arabicParts !== undefined) {
      arabicPartKeys.forEach((key) => {
        const lot = arabicParts[key];

        if (lot !== undefined && lot.planet) {
          const lotAntiscionChartElement: ChartElement = {
            id: chartElementsForAspect.current.length,
            isAntiscion: true,
            longitude: lot.antiscion,
            name: `${lot.partKey}-${fixedNames.antiscionName}`,
            elementType: "arabicPart",
            isFromOuterChart: false,
            isRetrograde: false,
          };

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
          const rSymbol = radius - overlapData.offset;
          const rLineStart = radius - lineStartOffset;
          const rLineEnd = radius;

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

          // chartElementsForAspect.current.push(lotAntiscionChartElement);
          chartElementsForAspect.current = [
            ...chartElementsForAspect.current,
            lotAntiscionChartElement,
          ];
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

      chartElementsForAspect.current.push({
        id: chartElementsForAspect.current.length,
        isAntiscion: false,
        longitude: decimalToDegreesMinutes(start),
        name: `${fixedNames.houseName}-${i}`,
        elementType: "house",
        isFromOuterChart: false,
        isRetrograde: false,
      });
    }

    if (showOuterchart && outerPlanets) {
      outerPlanets.forEach((planet) => {
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

        // chartElementsForAspect.current.push(chartElement);
        chartElementsForAspect.current = [
          ...chartElementsForAspect.current,
          chartElement,
        ];

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

          overlapData = getElementOverlapLongitudeAndOffset(
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
            .attr("stroke", "#ff914d") // antiscion color
            .attr("stroke-width", 1);

          // 6) desenha o ícone do planeta
          const iconAntSrc = `/planets/antiscion/${planet.type}${
            planet.isRetrograde ? "-rx" : ""
          }.png`;

          baseGroup
            .append("image")
            .attr("href", iconAntSrc) // no D3 v6+ use 'href'
            .attr("width", iconSize)
            .attr("height", iconSize)
            .attr("x", xAnts - iconSize / 2)
            .attr("y", yAnts - iconSize / 2);

          // chartElementsForAspect.current.push(chartElementAntiscion);
          chartElementsForAspect.current = [
            ...chartElementsForAspect.current,
            chartElementAntiscion,
          ];
        }
      });
    }

    if (showOuterchart && showArabicParts && outerArabicParts) {
      arabicPartKeys.forEach((key) => {
        const lot = outerArabicParts[key];

        if (lot !== undefined && lot.planet) {
          const outerLotChartElement: ChartElement = {
            id: chartElementsForAspect.current.length,
            isAntiscion: false,
            longitude: lot.longitude,
            name: `${fixedNames.outerKeyPrefix}-${lot.partKey}`,
            elementType: "arabicPart",
            isFromOuterChart: true,
            isRetrograde: false,
          };

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
          const iconSrc = `/planets/${key}.png`;

          baseGroup
            .append("image")
            .attr("href", iconSrc) // no D3 v6+ use 'href'
            .attr("width", iconSize)
            .attr("height", iconSize)
            // centraliza o ícone em (xs, ys)
            .attr("x", xs - iconSize / 2)
            .attr("y", ys - iconSize / 2);

          // chartElementsForAspect.current.push(outerLotChartElement);
          chartElementsForAspect.current = [
            ...chartElementsForAspect.current,
            outerLotChartElement,
          ];
        }
      });
    }

    if (showOuterchart && showArabicPartsAntiscia && outerArabicParts) {
      arabicPartKeys.forEach((key) => {
        const lot = outerArabicParts[key];
        if (lot !== undefined && lot.planet) {
          const outerLotChartElementAntiscion: ChartElement = {
            id: chartElementsForAspect.current.length,
            isAntiscion: true,
            longitude: lot.antiscion,
            name: `${fixedNames.outerKeyPrefix}-${lot.partKey}-${fixedNames.antiscionName}`,
            elementType: "arabicPart",
            isFromOuterChart: true,
            isRetrograde: false,
          };

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

          // chartElementsForAspect.current.push(outerLotChartElementAntiscion);
          chartElementsForAspect.current = [
            ...chartElementsForAspect.current,
            outerLotChartElementAntiscion,
          ];
        }
      });
    }

    // Desenha as cúspide das casas do mapa externo
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

        chartElementsForAspect.current.push({
          id: chartElementsForAspect.current.length,
          isAntiscion: false,
          longitude: decimalToDegreesMinutes(startDeg),
          name: `${fixedNames.outerKeyPrefix}-${fixedNames.houseName}-${j}`,
          elementType: "house",
          isFromOuterChart: true,
          isRetrograde: false,
        });
      }
    }

    drawAspects(chartElementsForAspect.current, {
      baseGroup,
      radius: smallInnerRadius,
      lineStartOffset,
    });
  }, [
    planets,
    housesData,
    // gap,
    // rowSize,
    // maxRowsBeforeDiagonal,
    // rowInwardStep,
    // perpSpacing,
    // diagonalPerpStep,
    // diagonalInwardStep,
    showArabicParts,
    showPlanetsAntiscia,
    showArabicPartsAntiscia,
    testValue,
  ]);

  useEffect(() => {
    fixedStarsAspects.forEach((asp) => {
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
      const iconSrc = "star-1.png";

      baseGroupRef.current
        ?.append("image")
        .attr("href", iconSrc) // no D3 v6+ use 'href'
        .attr("width", iconSize)
        .attr("height", iconSize)
        .attr("x", xs - iconSize / 2)
        .attr("y", ys - iconSize / 2)
        .attr("opacity", 0.5);
    });
  }, [fixedStarsAspects]);

  const toggleArabicParts = () => {
    setShowArabicParts((prev) => !prev);
  };

  const toggleAntiscia = () => {
    setShowPlanetsAntiscia((prev) => !prev);
  };

  const toggleArabicPartsAntiscia = () => {
    setShowArabicPartsAntiscia((prev) => !prev);
  };

  const containerClasses = showOuterchart ? "mb-16 mt-10" : "mb-2";

  return (
    <div
      className={`w-full md:w-[40vw] flex flex-col justify-center items-center md:mx-10 gap-8`}
    >
      <AstroChartMenu
        toggleCombineWithBirthChart={
          combineWithBirthChart !== undefined
            ? combineWithBirthChart
            : undefined
        }
        toggleCombineWithReturnChart={
          combineWithReturnChart !== undefined
            ? combineWithReturnChart
            : undefined
        }
        togglePlanetsAntiscia={toggleAntiscia}
        toggleArabicParts={toggleArabicParts}
        toggleArabicPartsAntiscia={toggleArabicPartsAntiscia}
      />

      {/* <label>
        Teste:
        <input
          type="number"
          className="w-2/12 border-2 rounded-sm ml-1 mb-1"
          value={testValue}
          onChange={(e) => setTestValue(Number.parseFloat(e.target.value))}
        />
      </label> */}

      <svg className={containerClasses} ref={ref}></svg>
      {/* <div className="w-[80vw] flex flex-row items-center justify-between">
        <AstroChartOverlapDebugFields
          gap={gap}
          onGap={(val) => setGap(val)}
          rowSize={rowSize}
          onRowSize={(val) => setRowSize(val)}
          maxRowsBeforeDiagonal={maxRowsBeforeDiagonal}
          onMaxRowsBeforeDiagonal={(val) => setMaxRowsBeforeDiagonal(val)}
          rowInwardStep={rowInwardStep}
          onRowInwardStep={(val) => setRowInwardStep(val)}
          perpSpacing={perpSpacing}
          onPerpSpacing={(val) => setPerpSpacing(val)}
          diagonalPerpStep={diagonalPerpStep}
          onDiagonalPerpStep={(val) => setDiagonalPerpStep(val)}
          diagonalInwardStep={diagonalInwardStep}
          onDiagonalInwardStep={(val) => setDiagonalInwardStep(val)}
        />
      </div> */}
    </div>
  );
};

export default AstroChart;
