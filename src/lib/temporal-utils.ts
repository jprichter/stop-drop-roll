export type TimeFilter = "now" | "today" | "tomorrow" | "custom";

export interface TemporalSearchParams {
  timeFilter: TimeFilter;
  customStartTime?: string | null;
  customEndTime?: string | null;
  currentDate?: Date; // Optional for testing
}

export function getTemporalQueryBounds(params: TemporalSearchParams) {
  const { timeFilter, customStartTime, customEndTime, currentDate = new Date() } = params;
  
  // We ALWAYS care about the day of week for the provided currentDate
  const targetDayOfWeek = currentDate.getDay(); // 0 for Sunday, 6 for Saturday
  const currentTime = currentDate.toTimeString().slice(0, 5); // "HH:MM"

  let startTimeBound: string | null = null;
  let endTimeBound: string | null = null;
  let isNowFilter = false;

  if (timeFilter === "now") {
    startTimeBound = currentTime;
    endTimeBound = currentTime;
    isNowFilter = true;
  } else if (timeFilter === "today" || timeFilter === "tomorrow") {
    // For today/tomorrow, we just want all mats for that day
    // (targetDayOfWeek is already set from currentDate)
    startTimeBound = null;
    endTimeBound = null;
  } else if (timeFilter === "custom") {
    // For custom, we apply the time range if provided
    if (customStartTime && customEndTime) {
      startTimeBound = customStartTime;
      endTimeBound = customEndTime;
    }
  }

  return {
    targetDayOfWeek,
    startTimeBound,
    endTimeBound,
    isNowFilter
  };
}
