/**
 * Curated IANA timezone list for HRMS use.
 *
 * Covers the most common business timezones globally.
 * Sorted west → east by UTC offset.
 *
 * To add more zones later, just append to TIMEZONE_OPTIONS —
 * no DB changes needed since values are standard IANA strings.
 */
export const TIMEZONE_OPTIONS = [
  // Americas
  { value: 'Pacific/Honolulu', label: '(UTC-10:00) Hawaii' },
  { value: 'America/Anchorage', label: '(UTC-09:00) Alaska' },
  { value: 'America/Los_Angeles', label: '(UTC-08:00) Los Angeles (PT)' },
  { value: 'America/Denver', label: '(UTC-07:00) Denver (MT)' },
  { value: 'America/Chicago', label: '(UTC-06:00) Chicago (CT)' },
  { value: 'America/New_York', label: '(UTC-05:00) New York (ET)' },
  { value: 'America/Toronto', label: '(UTC-05:00) Toronto' },
  { value: 'America/Sao_Paulo', label: '(UTC-03:00) São Paulo' },

  // Europe & Africa
  { value: 'Europe/London', label: '(UTC+00:00) London (GMT)' },
  { value: 'Europe/Paris', label: '(UTC+01:00) Paris / Berlin' },
  { value: 'Europe/Amsterdam', label: '(UTC+01:00) Amsterdam' },
  { value: 'Europe/Helsinki', label: '(UTC+02:00) Helsinki / Kyiv' },
  { value: 'Africa/Cairo', label: '(UTC+02:00) Cairo' },
  { value: 'Europe/Moscow', label: '(UTC+03:00) Moscow' },
  { value: 'Africa/Nairobi', label: '(UTC+03:00) Nairobi' },

  // Middle East
  { value: 'Asia/Dubai', label: '(UTC+04:00) Dubai / Abu Dhabi' },
  { value: 'Asia/Riyadh', label: '(UTC+03:00) Riyadh' },
  { value: 'Asia/Karachi', label: '(UTC+05:00) Karachi' },

  // South Asia
  { value: 'Asia/Kolkata', label: '(UTC+05:30) India (IST)' },
  { value: 'Asia/Colombo', label: '(UTC+05:30) Sri Lanka' },
  { value: 'Asia/Dhaka', label: '(UTC+06:00) Dhaka' },
  { value: 'Asia/Kathmandu', label: '(UTC+05:45) Kathmandu' },

  // South-East Asia
  { value: 'Asia/Bangkok', label: '(UTC+07:00) Bangkok / Jakarta' },
  { value: 'Asia/Singapore', label: '(UTC+08:00) Singapore' },
  { value: 'Asia/Kuala_Lumpur', label: '(UTC+08:00) Kuala Lumpur' },
  { value: 'Asia/Manila', label: '(UTC+08:00) Manila' },

  // East Asia
  { value: 'Asia/Shanghai', label: '(UTC+08:00) China (CST)' },
  { value: 'Asia/Hong_Kong', label: '(UTC+08:00) Hong Kong' },
  { value: 'Asia/Seoul', label: '(UTC+09:00) Seoul' },
  { value: 'Asia/Tokyo', label: '(UTC+09:00) Tokyo' },

  // Oceania
  { value: 'Australia/Perth', label: '(UTC+08:00) Perth' },
  { value: 'Australia/Adelaide', label: '(UTC+09:30) Adelaide' },
  { value: 'Australia/Sydney', label: '(UTC+10:00) Sydney / Melbourne' },
  { value: 'Pacific/Auckland', label: '(UTC+12:00) Auckland' },
];

/**
 * Default fallback timezone used when browser detection doesn't
 * match any option in TIMEZONE_OPTIONS.
 */
export const DEFAULT_TIMEZONE = 'Asia/Kolkata';

/**
 * Detects the browser's IANA timezone and returns it if it exists
 * in TIMEZONE_OPTIONS. Falls back to DEFAULT_TIMEZONE otherwise.
 *
 * This means the form always pre-selects a valid option from the
 * curated list rather than an unrecognised zone.
 *
 * Examples:
 *   Browser = "Asia/Kolkata"      → "Asia/Kolkata"   (in list ✓)
 *   Browser = "Asia/Calcutta"     → "Asia/Kolkata"   (alias, not in list → fallback)
 *   Browser = "America/Vancouver" → "Asia/Kolkata"   (not in list → fallback)
 */
export const getDefaultTimezone = (): string => {
  const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const isInList = TIMEZONE_OPTIONS.some((opt) => opt.value === browserTz);
  return isInList ? browserTz : DEFAULT_TIMEZONE;
};
