/**
 * JLPT Exam calculation utility.
 * The official JLPT exam takes place worldwide twice a year:
 * 1. The 1st Sunday of July (Iyul oyining 1-yakshanbasi)
 * 2. The 1st Sunday of December (Dekabr oyining 1-yakshanbasi)
 */

export interface JLPTExamInfo {
  date: Date;
  daysRemaining: number;
  formattedDate: string;
  season: 'Iyul' | 'Dekabr';
  year: number;
}

const MONTH_NAMES_UZ = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'
];

/**
 * Calculates the first Sunday of a given year and month (0-indexed).
 */
function getFirstSundayOfMonth(year: number, monthIndex: number): Date {
  const date = new Date(year, monthIndex, 1, 9, 0, 0); // 9:00 AM local time
  const day = date.getDay(); // 0 is Sunday
  const daysUntilSunday = (7 - day) % 7;
  date.setDate(1 + daysUntilSunday);
  return date;
}

/**
 * Returns information about the next upcoming JLPT exam date and remaining days.
 */
export function getNextJLPTExamDate(fromDate: Date = new Date()): JLPTExamInfo {
  const currentYear = fromDate.getFullYear();

  // July exam (Month index 6)
  const julyExamThisYear = getFirstSundayOfMonth(currentYear, 6);
  // December exam (Month index 11)
  const decExamThisYear = getFirstSundayOfMonth(currentYear, 11);
  // Next year July exam
  const julyExamNextYear = getFirstSundayOfMonth(currentYear + 1, 6);

  let targetExamDate: Date;
  let season: 'Iyul' | 'Dekabr';

  // Compare end of exam day
  const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59).getTime();

  if (fromDate.getTime() <= endOfDay(julyExamThisYear)) {
    targetExamDate = julyExamThisYear;
    season = 'Iyul';
  } else if (fromDate.getTime() <= endOfDay(decExamThisYear)) {
    targetExamDate = decExamThisYear;
    season = 'Dekabr';
  } else {
    targetExamDate = julyExamNextYear;
    season = 'Iyul';
  }

  const diffMs = targetExamDate.getTime() - fromDate.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  const dayNum = targetExamDate.getDate();
  const monthName = MONTH_NAMES_UZ[targetExamDate.getMonth()];
  const examYear = targetExamDate.getFullYear();
  const formattedDate = `${dayNum}-${monthName}, ${examYear}`;

  return {
    date: targetExamDate,
    daysRemaining,
    formattedDate,
    season,
    year: examYear,
  };
}
