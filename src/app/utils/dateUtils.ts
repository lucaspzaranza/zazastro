export function getDaysInMonth(month: number, year: number | null): number {
  switch (month) {
    case 2:
      if (year === null) return 29;
      return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28;
    case 4:
    case 6:
    case 9:
    case 11:
      return 30;
    default:
      return 31;
  }
}

export function clampDayToMonth(day: number | null, month: number, year: number | null): number | null {
  if (day === null || day < 1) return day;
  return Math.min(day, getDaysInMonth(month, year));
}

export function isValidDayOfMonth(day: number, month: number, year: number | null): boolean {
  return Number.isInteger(day) && day >= 1 && day <= getDaysInMonth(month, year);
}
