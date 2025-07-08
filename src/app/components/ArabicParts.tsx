"use client";

import { useArabicParts } from "@/contexts/ArabicPartsContext";
import { useBirthChart } from "@/contexts/BirthChartContext";
import { useArabicPartCalculations } from "@/hooks/useArabicPartCalculations";
import { useEffect, useRef, useState } from "react";

export default function ArabicParts() {
  const { birthChart } = useBirthChart();
  const { arabicParts, updateArabicParts } = useArabicParts();
  const {
    calculateLotOfFortune,
    calculateLotOfSpirit,
    calculateLotOfNecessity,
    calculateLotOfLove,
    calculateLotOfValor,
    calculateLotOfVictory,
    calculateLotOfCaptivity,
    calculateLotOfMarriage,
    calculateLotOfResignation,
  } = useArabicPartCalculations();

  useEffect(() => {
    if (birthChart === undefined) return;

    updateArabicParts({
      fortune: calculateLotOfFortune(birthChart),
      spirit: calculateLotOfSpirit(birthChart),
    });
  }, [birthChart]);

  useEffect(() => {
    if (birthChart === undefined) return;

    if (arabicParts?.fortune && arabicParts.spirit) {
      updateArabicParts({
        necessity: calculateLotOfNecessity(birthChart),
        love: calculateLotOfLove(birthChart),
      });
    }

    if (arabicParts?.fortune) {
      updateArabicParts({
        valor: calculateLotOfValor(birthChart),
        captivity: calculateLotOfCaptivity(birthChart),
      });
    }

    if (arabicParts?.spirit) {
      updateArabicParts({
        victory: calculateLotOfVictory(birthChart),
      });
    }

    // Custom Arabic Parts
    updateArabicParts({
      marriage: calculateLotOfMarriage(birthChart),
      resignation: calculateLotOfResignation(birthChart),
    });
  }, [arabicParts?.fortune]);

  useEffect(() => {
    if (arabicParts === undefined) return;

    // console.log("Partes Árabes:");
    // console.log(arabicParts);
  }, [arabicParts]);

  if (arabicParts === undefined) return;

  return (
    <div className="flex flex-col gap-2 mt-4 text-left">
      <h2 className="text-xl font-bold">Partes Árabes</h2>
      <ul>
        <li>
          {arabicParts.fortune?.name}: {arabicParts.fortune?.longitudeSign}
          &nbsp; Antiscion: {arabicParts.fortune?.antiscionSign}
        </li>

        <li>
          {arabicParts.spirit?.name}: {arabicParts.spirit?.longitudeSign}&nbsp;
          Antiscion: {arabicParts.spirit?.antiscionSign}
        </li>

        <li>
          {arabicParts.necessity?.name}: {arabicParts.necessity?.longitudeSign}
          &nbsp; Antiscion: {arabicParts.necessity?.antiscionSign}
        </li>

        <li>
          {arabicParts.love?.name}: {arabicParts.love?.longitudeSign}&nbsp;
          Antiscion: {arabicParts.love?.antiscionSign}
        </li>

        <li>
          {arabicParts.valor?.name}: {arabicParts.valor?.longitudeSign}&nbsp;
          Antiscion: {arabicParts.valor?.antiscionSign}
        </li>

        <li>
          {arabicParts.victory?.name}: {arabicParts.victory?.longitudeSign}
          &nbsp; Antiscion: {arabicParts.victory?.antiscionSign}
        </li>

        <li>
          {arabicParts.captivity?.name}: {arabicParts.captivity?.longitudeSign}
          &nbsp; Antiscion: {arabicParts.captivity?.antiscionSign}
        </li>

        <li>
          {arabicParts.marriage?.name}: {arabicParts.marriage?.longitudeSign}
          &nbsp; Antiscion: {arabicParts.marriage?.antiscionSign}
        </li>

        <li>
          {arabicParts.resignation?.name}:{" "}
          {arabicParts.resignation?.longitudeSign}&nbsp; Antiscion:{" "}
          {arabicParts.resignation?.antiscionSign}
        </li>
      </ul>
    </div>
  );
}
