// to get full date range
export const getFullDayRange = (date: Date | null) => {
  if (!date) return [undefined, undefined];
  // Start of day in local time, then convert to UTC ISO string
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return [start.toISOString(), end.toISOString()];
};
