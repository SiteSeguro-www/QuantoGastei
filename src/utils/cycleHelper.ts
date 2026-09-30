import { MonthCycleInfo } from '../types/finance';

/**
 * Calculates the exact financial month cycle boundaries based on the user's custom start day.
 * Example:
 * If startDay = 5 and today is Sep 30, 2026:
 * - Start date: 2026-09-05
 * - End date: 2026-10-04
 * - Days remaining until next cycle: 4 days
 * 
 * If startDay = 1 and today is Sep 30, 2026:
 * - Start date: 2026-09-01
 * - End date: 2026-09-30
 * - Days remaining: 0 days (ends today)
 */
export const calculateMonthCycle = (startDay: number = 1, refDate: Date = new Date()): MonthCycleInfo => {
  const safeStartDay = Math.max(1, Math.min(31, Math.floor(startDay || 1)));
  const year = refDate.getFullYear();
  const month = refDate.getMonth(); // 0-indexed
  const currentDay = refDate.getDate();

  let startYear = year;
  let startMonth = month;
  let endYear = year;
  let endMonth = month;

  if (safeStartDay === 1) {
    // Standard calendar month
    startYear = year;
    startMonth = month;
    endYear = year;
    endMonth = month;
    
    // Days in current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const startDateObj = new Date(year, month, 1, 0, 0, 0);
    const endDateObj = new Date(year, month, daysInMonth, 23, 59, 59);

    const startDateStr = formatDateISO(startDateObj);
    const endDateStr = formatDateISO(endDateObj);

    const msPerDay = 1000 * 60 * 60 * 24;
    const totalDaysInCycle = daysInMonth;
    const currentDayInCycle = currentDay;
    const daysRemaining = Math.max(0, daysInMonth - currentDay);
    const percentageElapsed = Math.min(100, Math.max(0, Math.round((currentDayInCycle / totalDaysInCycle) * 100)));

    const startFormatted = `${String(1).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}`;
    const endFormatted = `${String(daysInMonth).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}`;
    
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const cycleLabel = `${monthNames[month]} / ${year}`;

    return {
      startDay: safeStartDay,
      startDate: startDateStr,
      endDate: endDateStr,
      startFormatted,
      endFormatted,
      daysRemaining,
      totalDaysInCycle,
      currentDayInCycle,
      percentageElapsed,
      cycleLabel,
      isCustomCycle: false,
    };
  }

  // Custom cycle (e.g. Day 5 to Day 4)
  if (currentDay >= safeStartDay) {
    // Current cycle started in this month
    startYear = year;
    startMonth = month;
    
    // Ends in next month
    if (month === 11) {
      endYear = year + 1;
      endMonth = 0;
    } else {
      endYear = year;
      endMonth = month + 1;
    }
  } else {
    // Current cycle started in previous month
    if (month === 0) {
      startYear = year - 1;
      startMonth = 11;
    } else {
      startYear = year;
      startMonth = month - 1;
    }
    endYear = year;
    endMonth = month;
  }

  // Handle month length for start day
  const maxDaysInStartMonth = new Date(startYear, startMonth + 1, 0).getDate();
  const actualStartDay = Math.min(safeStartDay, maxDaysInStartMonth);
  const startDateObj = new Date(startYear, startMonth, actualStartDay, 0, 0, 0);

  // End day is (safeStartDay - 1). If safeStartDay is 1 (handled above), else safeStartDay - 1
  const targetEndDay = safeStartDay - 1;
  const maxDaysInEndMonth = new Date(endYear, endMonth + 1, 0).getDate();
  const actualEndDay = Math.min(targetEndDay, maxDaysInEndMonth);
  const endDateObj = new Date(endYear, endMonth, actualEndDay, 23, 59, 59);

  const startDateStr = formatDateISO(startDateObj);
  const endDateStr = formatDateISO(endDateObj);

  const msPerDay = 1000 * 60 * 60 * 24;
  const totalDaysInCycle = Math.round((endDateObj.getTime() - startDateObj.getTime()) / msPerDay) + 1;
  
  const todayAtStart = new Date(year, month, currentDay, 0, 0, 0);
  const daysFromStart = Math.round((todayAtStart.getTime() - startDateObj.getTime()) / msPerDay) + 1;
  const currentDayInCycle = Math.max(1, Math.min(totalDaysInCycle, daysFromStart));
  
  const daysRemaining = Math.max(0, totalDaysInCycle - currentDayInCycle);
  const percentageElapsed = Math.min(100, Math.max(0, Math.round((currentDayInCycle / totalDaysInCycle) * 100)));

  const startFormatted = `${String(actualStartDay).padStart(2, '0')}/${String(startMonth + 1).padStart(2, '0')}`;
  const endFormatted = `${String(actualEndDay).padStart(2, '0')}/${String(endMonth + 1).padStart(2, '0')}`;
  const cycleLabel = `${startFormatted} a ${endFormatted}`;

  return {
    startDay: safeStartDay,
    startDate: startDateStr,
    endDate: endDateStr,
    startFormatted,
    endFormatted,
    daysRemaining,
    totalDaysInCycle,
    currentDayInCycle,
    percentageElapsed,
    cycleLabel,
    isCustomCycle: true,
  };
};

/**
 * Checks if a given date string 'YYYY-MM-DD' falls within the active cycle
 */
export const isDateInCycle = (dateStr: string, cycle: MonthCycleInfo): boolean => {
  return dateStr >= cycle.startDate && dateStr <= cycle.endDate;
};

const formatDateISO = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
