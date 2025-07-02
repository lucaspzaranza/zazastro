export function getSign(longitude: number) {
  const signs = [
    "Áries ♈",
    "Touro ♉",
    "Gêmeos ♊",
    "Câncer ♋",
    "Leão ♌",
    "Virgem ♍",
    "Libra ♎",
    "Escorpião ♏",
    "Sagitário ♐",
    "Capricórnio ♑",
    "Aquário ♒",
    "Peixes ♓",
  ];
  return signs[Math.floor(longitude / 30) % 12];
}

export function getDegreeAndSign(longitude: number) {
  const sign = getSign(longitude);
  const previousSign = Math.floor(longitude / 30);
  const rest = (longitude - previousSign * 30).toFixed(2);

  const result = `${rest} de ${sign}`;

  return result;
}

export function decimalToDegreesMinutes(decimal: number) {
  const degrees = Math.floor(decimal);
  const minutes = Math.floor((decimal - degrees) * 61) / 100;

  const result = degrees + minutes;
  return result;
}

export function getAntiscion(longitude: number, getRaw = false) {
  if (longitude < 180) {
    const distance = 90 - longitude;
    const result = 90 + distance;
    return getRaw ? result : decimalToDegreesMinutes(result);
  } else {
    const distance = 270 - longitude;
    const result = 270 + distance;

    return getRaw ? result : decimalToDegreesMinutes(result);
  }
}
