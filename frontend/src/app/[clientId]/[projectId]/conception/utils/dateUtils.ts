import { DAY_MS } from '../constants';

// Date utilities (UTC-safe)
export const toUTC = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());

export const startOfDay = (d: Date) => new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));

export const startOfWeekMon = (d: Date) => {
  const sd = startOfDay(d);
  const dow = (sd.getUTCDay() + 6) % 7; // 0=Mon, ... 6=Sun
  return new Date(sd.getTime() - dow * DAY_MS);
};

export const startOfMonth = (d: Date) => new Date(Date.UTC(d.getFullYear(), d.getMonth(), 1));

export const endOfMonth = (d: Date) => new Date(Date.UTC(d.getFullYear(), d.getMonth() + 1, 0));

export const addDays = (d: Date, days: number) => new Date(d.getTime() + days * DAY_MS);

export const addWeeks = (d: Date, weeks: number) => addDays(d, weeks * 7);

export const addMonths = (d: Date, months: number) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + months, d.getUTCDate()));

export const daysInMonth = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();

// ISO week helpers
export const getISOWeek = (date: Date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / DAY_MS) + 1) / 7);
};

export const getISOWeekYear = (date: Date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  return d.getUTCFullYear();
};

export const isDateInRange = (d: Date, start: Date, end: Date) => {
  const du = toUTC(d), su = toUTC(start), eu = toUTC(end);
  return du >= su && du <= eu;
};

export const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('fr-FR', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  });
};
