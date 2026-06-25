import { Sign, TermOrDecan } from "@/interfaces/BirthChartInterfaces";

export const EGYPTIAN_TERMS: Record<Sign, TermOrDecan[]> = {
  Aries: [
    { start: 0, end: 6, ruler: "jupiter" },
    { start: 6, end: 12, ruler: "venus" },
    { start: 12, end: 20, ruler: "mercury" },
    { start: 20, end: 25, ruler: "mars" },
    { start: 25, end: 30, ruler: "saturn" },
  ],

  Taurus: [
    { start: 0, end: 8, ruler: "venus" },
    { start: 8, end: 14, ruler: "mercury" },
    { start: 14, end: 22, ruler: "jupiter" },
    { start: 22, end: 27, ruler: "saturn" },
    { start: 27, end: 30, ruler: "mars" },
  ],

  Gemini: [
    { start: 0, end: 6, ruler: "mercury" },
    { start: 6, end: 12, ruler: "jupiter" },
    { start: 12, end: 17, ruler: "venus" },
    { start: 17, end: 24, ruler: "mars" },
    { start: 24, end: 30, ruler: "saturn" },
  ],

  Cancer: [
    { start: 0, end: 7, ruler: "mars" },
    { start: 7, end: 13, ruler: "venus" },
    { start: 13, end: 19, ruler: "mercury" },
    { start: 19, end: 26, ruler: "jupiter" },
    { start: 26, end: 30, ruler: "saturn" },
  ],

  Leo: [
    { start: 0, end: 6, ruler: "jupiter" },
    { start: 6, end: 11, ruler: "venus" },
    { start: 11, end: 18, ruler: "saturn" },
    { start: 18, end: 24, ruler: "mercury" },
    { start: 24, end: 30, ruler: "mars" },
  ],

  Virgo: [
    { start: 0, end: 7, ruler: "mercury" },
    { start: 7, end: 17, ruler: "venus" },
    { start: 17, end: 21, ruler: "jupiter" },
    { start: 21, end: 28, ruler: "mars" },
    { start: 28, end: 30, ruler: "saturn" },
  ],

  Libra: [
    { start: 0, end: 6, ruler: "saturn" },
    { start: 6, end: 14, ruler: "mercury" },
    { start: 14, end: 21, ruler: "jupiter" },
    { start: 21, end: 28, ruler: "venus" },
    { start: 28, end: 30, ruler: "mars" },
  ],

  Scorpio: [
    { start: 0, end: 7, ruler: "mars" },
    { start: 7, end: 11, ruler: "venus" },
    { start: 11, end: 19, ruler: "mercury" },
    { start: 19, end: 24, ruler: "jupiter" },
    { start: 24, end: 30, ruler: "saturn" },
  ],

  Sagittarius: [
    { start: 0, end: 12, ruler: "jupiter" },
    { start: 12, end: 17, ruler: "venus" },
    { start: 17, end: 21, ruler: "mercury" },
    { start: 21, end: 26, ruler: "saturn" },
    { start: 26, end: 30, ruler: "mars" },
  ],

  Capricorn: [
    { start: 0, end: 7, ruler: "mercury" },
    { start: 7, end: 14, ruler: "jupiter" },
    { start: 14, end: 22, ruler: "venus" },
    { start: 22, end: 26, ruler: "saturn" },
    { start: 26, end: 30, ruler: "mars" },
  ],

  Aquarius: [
    { start: 0, end: 7, ruler: "mercury" },
    { start: 7, end: 13, ruler: "venus" },
    { start: 13, end: 20, ruler: "jupiter" },
    { start: 20, end: 25, ruler: "mars" },
    { start: 25, end: 30, ruler: "saturn" },
  ],

  Pisces: [
    { start: 0, end: 12, ruler: "venus" },
    { start: 12, end: 16, ruler: "jupiter" },
    { start: 16, end: 19, ruler: "mercury" },
    { start: 19, end: 28, ruler: "mars" },
    { start: 28, end: 30, ruler: "saturn" },
  ],
};

export const PTOLEMAIC_TERMS: Record<Sign, TermOrDecan[]> = {
  Aries: [
    { start: 0, end: 6, ruler: "jupiter" },
    { start: 6, end: 14, ruler: "venus" },
    { start: 14, end: 21, ruler: "mercury" },
    { start: 21, end: 26, ruler: "mars" },
    { start: 26, end: 30, ruler: "saturn" },
  ],

  Taurus: [
    { start: 0, end: 8, ruler: "venus" },
    { start: 8, end: 15, ruler: "mercury" },
    { start: 15, end: 22, ruler: "jupiter" },
    { start: 22, end: 28, ruler: "saturn" },
    { start: 28, end: 30, ruler: "mars" },
  ],

  Gemini: [
    { start: 0, end: 7, ruler: "mercury" },
    { start: 7, end: 14, ruler: "jupiter" },
    { start: 14, end: 21, ruler: "venus" },
    { start: 21, end: 27, ruler: "saturn" },
    { start: 27, end: 30, ruler: "mars" },
  ],

  Cancer: [
    { start: 0, end: 6, ruler: "mars" },
    { start: 6, end: 13, ruler: "jupiter" },
    { start: 13, end: 20, ruler: "mercury" },
    { start: 20, end: 27, ruler: "venus" },
    { start: 27, end: 30, ruler: "saturn" },
  ],

  Leo: [
    { start: 0, end: 6, ruler: "jupiter" },
    { start: 6, end: 13, ruler: "mercury" },
    { start: 13, end: 19, ruler: "saturn" },
    { start: 19, end: 25, ruler: "venus" },
    { start: 25, end: 30, ruler: "mars" },
  ],

  Virgo: [
    { start: 0, end: 7, ruler: "mercury" },
    { start: 7, end: 13, ruler: "venus" },
    { start: 13, end: 18, ruler: "jupiter" },
    { start: 18, end: 24, ruler: "mars" },
    { start: 24, end: 30, ruler: "saturn" },
  ],

  Libra: [
    { start: 0, end: 6, ruler: "saturn" },
    { start: 6, end: 11, ruler: "venus" },
    { start: 11, end: 16, ruler: "jupiter" },
    { start: 16, end: 24, ruler: "mercury" },
    { start: 24, end: 30, ruler: "mars" },
  ],

  Scorpio: [
    { start: 0, end: 6, ruler: "mars" },
    { start: 6, end: 13, ruler: "venus" },
    { start: 13, end: 21, ruler: "mercury" },
    { start: 21, end: 27, ruler: "jupiter" },
    { start: 27, end: 30, ruler: "saturn" },
  ],

  Sagittarius: [
    { start: 0, end: 8, ruler: "jupiter" },
    { start: 8, end: 14, ruler: "venus" },
    { start: 14, end: 19, ruler: "mercury" },
    { start: 19, end: 25, ruler: "saturn" },
    { start: 25, end: 30, ruler: "mars" },
  ],

  Capricorn: [
    { start: 0, end: 8, ruler: "venus" },
    { start: 8, end: 13, ruler: "mercury" },
    { start: 13, end: 19, ruler: "jupiter" },
    { start: 19, end: 24, ruler: "mars" },
    { start: 24, end: 30, ruler: "saturn" },
  ],

  Aquarius: [
    { start: 0, end: 6, ruler: "mercury" },
    { start: 6, end: 12, ruler: "venus" },
    { start: 12, end: 20, ruler: "jupiter" },
    { start: 20, end: 25, ruler: "mars" },
    { start: 25, end: 30, ruler: "saturn" },
  ],

  Pisces: [
    { start: 0, end: 8, ruler: "venus" },
    { start: 8, end: 15, ruler: "jupiter" },
    { start: 15, end: 21, ruler: "mercury" },
    { start: 21, end: 26, ruler: "mars" },
    { start: 26, end: 30, ruler: "saturn" },
  ],
};

export const CHALDEAN_DECANS: Record<Sign, TermOrDecan[]> = {
  Aries: [
    { start: 0, end: 10, ruler: "mars" },
    { start: 10, end: 20, ruler: "sun" },
    { start: 20, end: 30, ruler: "venus" },
  ],

  Taurus: [
    { start: 0, end: 10, ruler: "mercury" },
    { start: 10, end: 20, ruler: "moon" },
    { start: 20, end: 30, ruler: "saturn" },
  ],

  Gemini: [
    { start: 0, end: 10, ruler: "jupiter" },
    { start: 10, end: 20, ruler: "mars" },
    { start: 20, end: 30, ruler: "sun" },
  ],

  Cancer: [
    { start: 0, end: 10, ruler: "venus" },
    { start: 10, end: 20, ruler: "mercury" },
    { start: 20, end: 30, ruler: "moon" },
  ],

  Leo: [
    { start: 0, end: 10, ruler: "saturn" },
    { start: 10, end: 20, ruler: "jupiter" },
    { start: 20, end: 30, ruler: "mars" },
  ],

  Virgo: [
    { start: 0, end: 10, ruler: "sun" },
    { start: 10, end: 20, ruler: "venus" },
    { start: 20, end: 30, ruler: "mercury" },
  ],

  Libra: [
    { start: 0, end: 10, ruler: "moon" },
    { start: 10, end: 20, ruler: "saturn" },
    { start: 20, end: 30, ruler: "jupiter" },
  ],

  Scorpio: [
    { start: 0, end: 10, ruler: "mars" },
    { start: 10, end: 20, ruler: "sun" },
    { start: 20, end: 30, ruler: "venus" },
  ],

  Sagittarius: [
    { start: 0, end: 10, ruler: "mercury" },
    { start: 10, end: 20, ruler: "moon" },
    { start: 20, end: 30, ruler: "saturn" },
  ],

  Capricorn: [
    { start: 0, end: 10, ruler: "jupiter" },
    { start: 10, end: 20, ruler: "mars" },
    { start: 20, end: 30, ruler: "sun" },
  ],

  Aquarius: [
    { start: 0, end: 10, ruler: "venus" },
    { start: 10, end: 20, ruler: "mercury" },
    { start: 20, end: 30, ruler: "moon" },
  ],

  Pisces: [
    { start: 0, end: 10, ruler: "saturn" },
    { start: 10, end: 20, ruler: "jupiter" },
    { start: 20, end: 30, ruler: "mars" },
  ],
};