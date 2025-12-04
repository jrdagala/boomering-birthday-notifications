import moment from 'moment-timezone';

/**
 * Location interface for timezone lookup
 */
export interface Location {
  city: string;
  state?: string;
  country: string;
}

/**
 * Get timezone from location
 * This is a simplified mapping. In production, you would use a more comprehensive
 * timezone database or API like GeoNames or Google Time Zone API.
 *
 * @param location - User's location
 * @returns IANA timezone string (e.g., 'America/New_York')
 */
export function getTimezoneFromLocation(
  city: string,
  state: string | undefined,
  country: string
): string {
  // Simplified timezone mapping by city/state/country
  // In production, use a proper timezone API or database

  const cityLower = city.toLowerCase();
  const stateLower = (state || '').toLowerCase();
  const countryLower = country.toLowerCase();

  // USA timezones
  if (countryLower === 'usa' || countryLower === 'united states') {
    const stateTimezones: { [key: string]: string } = {
      'new york': 'America/New_York',
      california: 'America/Los_Angeles',
      texas: 'America/Chicago',
      florida: 'America/New_York',
      illinois: 'America/Chicago',
      washington: 'America/Los_Angeles',
      colorado: 'America/Denver',
      arizona: 'America/Phoenix',
      hawaii: 'Pacific/Honolulu',
      alaska: 'America/Anchorage',
    };

    if (stateLower && stateTimezones[stateLower]) {
      return stateTimezones[stateLower];
    }

    // City-specific overrides
    if (cityLower.includes('new york')) return 'America/New_York';
    if (cityLower.includes('los angeles')) return 'America/Los_Angeles';
    if (cityLower.includes('chicago')) return 'America/Chicago';
    if (cityLower.includes('houston')) return 'America/Chicago';
    if (cityLower.includes('phoenix')) return 'America/Phoenix';
    if (cityLower.includes('denver')) return 'America/Denver';
    if (cityLower.includes('seattle')) return 'America/Los_Angeles';

    // Default US timezone
    return 'America/New_York';
  }

  // Common international cities
  const cityTimezones: { [key: string]: string } = {
    london: 'Europe/London',
    paris: 'Europe/Paris',
    berlin: 'Europe/Berlin',
    tokyo: 'Asia/Tokyo',
    sydney: 'Australia/Sydney',
    singapore: 'Asia/Singapore',
    dubai: 'Asia/Dubai',
    mumbai: 'Asia/Kolkata',
    'hong kong': 'Asia/Hong_Kong',
    toronto: 'America/Toronto',
    vancouver: 'America/Vancouver',
    'mexico city': 'America/Mexico_City',
    'sao paulo': 'America/Sao_Paulo',
    'buenos aires': 'America/Argentina/Buenos_Aires',
  };

  if (cityTimezones[cityLower]) {
    return cityTimezones[cityLower];
  }

  // Country fallback timezones
  const countryTimezones: { [key: string]: string } = {
    uk: 'Europe/London',
    'united kingdom': 'Europe/London',
    france: 'Europe/Paris',
    germany: 'Europe/Berlin',
    japan: 'Asia/Tokyo',
    australia: 'Australia/Sydney',
    singapore: 'Asia/Singapore',
    india: 'Asia/Kolkata',
    china: 'Asia/Shanghai',
    canada: 'America/Toronto',
    mexico: 'America/Mexico_City',
    brazil: 'America/Sao_Paulo',
    philippines: 'Asia/Manila',
  };

  if (countryTimezones[countryLower]) {
    return countryTimezones[countryLower];
  }

  // Default to UTC if unknown
  console.warn(`Unknown timezone for location: ${city}, ${state}, ${country}. Using UTC.`);
  return 'UTC';
}

/**
 * Calculate the next birthday at 9am in the user's local time, converted to UTC
 * @param birthday - Birthday in YYYY-MM-DD format
 * @param location - User's location (city, state, country)
 * @returns ISO timestamp for next birthday at 9am local time in UTC
 */
export function calculateNextBirthdayUTC(birthday: string, location: Location): string {
  // Get the user's timezone
  const { city, state, country } = location;
  const timezone = getTimezoneFromLocation(city, state, country);

  // Parse the birthday
  const [, month, day] = birthday.split('-').map(Number);

  // Get current time in user's timezone
  const nowInTimezone = moment.tz(timezone);
  const currentYear = nowInTimezone.year();

  // Create birthday at 9am in user's timezone for this year
  let nextBirthday = moment.tz(
    {
      year: currentYear,
      month: month - 1, // moment months are 0-indexed
      day: day,
      hour: 9,
      minute: 0,
      second: 0,
    },
    timezone
  );

  // If birthday has already passed this year, use next year
  if (nextBirthday.isSameOrBefore(nowInTimezone)) {
    nextBirthday = moment.tz(
      {
        year: currentYear + 1,
        month: month - 1,
        day: day,
        hour: 9,
        minute: 0,
        second: 0,
      },
      timezone
    );
  }

  // Convert to UTC and return as ISO string
  return nextBirthday.utc().toISOString();
}

/**
 * Get the current year for notification tracking
 */
export function getCurrentYear(): number {
  return moment().year();
}

/**
 * Check if a notification should be sent
 * @param nextBirthdayUTC - Next birthday timestamp
 * @param lastNotificationYear - Year of last notification
 * @returns true if notification should be sent
 */
export function shouldSendNotification(
  nextBirthdayUTC: string,
  lastNotificationYear: number
): boolean {
  const now = moment();
  const nextBirthday = moment(nextBirthdayUTC);
  const currentYear = getCurrentYear();

  return nextBirthday.isSameOrBefore(now) && lastNotificationYear < currentYear;
}
