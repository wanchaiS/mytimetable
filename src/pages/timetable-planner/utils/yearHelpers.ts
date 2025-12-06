/**
 * Get available year options based on current date
 * Logic:
 * - Always show current year
 * - If current month is December (month index 11), also show next year
 * - Maximum 2 options
 */
export function getAvailableYears(): number[] {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed (December = 11)

  if (currentMonth === 11) {
    return [currentYear, currentYear + 1];
  }

  return [currentYear];
}
