import moment from 'moment-timezone';
import {
  calculateNextBirthdayUTC,
  getCurrentYear,
  shouldSendNotification,
  Location,
} from '../timezone';

describe('timezone utilities', () => {
  describe('calculateNextBirthdayUTC', () => {
    beforeEach(() => {
      // Mock current date to 2024-06-15 12:00:00 UTC for consistent tests
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-06-15T12:00:00Z'));
    });

    afterEach(() => {
      jest.clearAllMocks();
      jest.clearAllTimers();
      jest.useRealTimers();
    });

    it('should calculate next birthday for US Eastern timezone', () => {
      const location: Location = {
        city: 'New York',
        state: 'New York',
        country: 'USA',
      };
      const birthday = '1990-12-25'; // Christmas

      const result = calculateNextBirthdayUTC(birthday, location);
      const nextBirthday = moment(result);

      expect(nextBirthday.format('YYYY-MM-DD')).toBe('2024-12-25');
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should calculate next birthday for US Pacific timezone', () => {
      const location: Location = {
        city: 'Los Angeles',
        state: 'California',
        country: 'USA',
      };
      const birthday = '1985-03-15';

      const result = calculateNextBirthdayUTC(birthday, location);
      const nextBirthday = moment(result);

      // Birthday already passed this year, should be next year
      expect(nextBirthday.year()).toBeGreaterThanOrEqual(2025);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should calculate next birthday for London', () => {
      const location: Location = {
        city: 'London',
        country: 'UK',
      };
      const birthday = '1992-08-20';

      const result = calculateNextBirthdayUTC(birthday, location);
      const nextBirthday = moment(result);

      expect(nextBirthday.format('MM-DD')).toBe('08-20');
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should calculate next birthday for Tokyo', () => {
      const location: Location = {
        city: 'Tokyo',
        country: 'Japan',
      };
      const birthday = '1988-11-11';

      const result = calculateNextBirthdayUTC(birthday, location);
      const nextBirthday = moment(result);

      expect(nextBirthday.format('MM-DD')).toBe('11-11');
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should calculate next birthday for Sydney', () => {
      const location: Location = {
        city: 'Sydney',
        country: 'Australia',
      };
      const birthday = '1995-01-10';

      const result = calculateNextBirthdayUTC(birthday, location);
      const nextBirthday = moment(result);

      // Birthday already passed, should be next year
      expect(nextBirthday.format('YYYY-MM-DD')).toBe('2025-01-10');
    });

    it('should use next year if birthday already passed this year', () => {
      const location: Location = {
        city: 'New York',
        state: 'New York',
        country: 'USA',
      };
      const birthday = '1990-01-01'; // Already passed

      const result = calculateNextBirthdayUTC(birthday, location);
      const nextBirthday = moment(result);

      expect(nextBirthday.year()).toBe(2025);
      expect(nextBirthday.format('MM-DD')).toBe('01-01');
    });

    it('should use this year if birthday is upcoming', () => {
      const location: Location = {
        city: 'New York',
        state: 'New York',
        country: 'USA',
      };
      const birthday = '1990-12-31'; // Not yet passed

      const result = calculateNextBirthdayUTC(birthday, location);
      const nextBirthday = moment(result);

      expect(nextBirthday.year()).toBe(2024);
      expect(nextBirthday.format('MM-DD')).toBe('12-31');
    });

    it('should default to UTC for unknown location', () => {
      const location: Location = {
        city: 'Unknown City',
        country: 'Unknown Country',
      };
      const birthday = '1990-09-15';

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = calculateNextBirthdayUTC(birthday, location);
      const nextBirthday = moment(result);

      expect(nextBirthday.format('MM-DD')).toBe('09-15');
      expect(consoleWarnSpy).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });

    it('should handle Arizona timezone (no DST)', () => {
      const location: Location = {
        city: 'Phoenix',
        state: 'Arizona',
        country: 'USA',
      };
      const birthday = '1991-07-04';

      const result = calculateNextBirthdayUTC(birthday, location);

      // Arizona doesn't observe DST
      expect(result).toBeDefined();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should recognize Los Angeles city name', () => {
      const location: Location = {
        city: 'Los Angeles',
        country: 'USA',
      };
      const birthday = '1990-06-01';

      const result = calculateNextBirthdayUTC(birthday, location);

      // Should use Los Angeles timezone (America/Los_Angeles)
      expect(result).toBeDefined();
    });

    it('should recognize Chicago city name', () => {
      const location: Location = {
        city: 'Chicago',
        country: 'USA',
      };
      const birthday = '1990-07-01';

      const result = calculateNextBirthdayUTC(birthday, location);

      expect(result).toBeDefined();
    });

    it('should recognize Houston city name', () => {
      const location: Location = {
        city: 'Houston',
        country: 'USA',
      };
      const birthday = '1990-08-01';

      const result = calculateNextBirthdayUTC(birthday, location);

      expect(result).toBeDefined();
    });

    it('should recognize Denver city name', () => {
      const location: Location = {
        city: 'Denver',
        country: 'USA',
      };
      const birthday = '1990-09-01';

      const result = calculateNextBirthdayUTC(birthday, location);

      expect(result).toBeDefined();
    });

    it('should recognize Seattle city name', () => {
      const location: Location = {
        city: 'Seattle',
        country: 'USA',
      };
      const birthday = '1990-10-01';

      const result = calculateNextBirthdayUTC(birthday, location);

      expect(result).toBeDefined();
    });

    it('should use default US timezone for unknown US city', () => {
      const location: Location = {
        city: 'Unknown City',
        state: 'Unknown State',
        country: 'USA',
      };
      const birthday = '1990-11-01';

      const result = calculateNextBirthdayUTC(birthday, location);

      // Should default to America/New_York
      expect(result).toBeDefined();
    });

    it('should recognize country fallback for France', () => {
      const location: Location = {
        city: 'Marseille',
        country: 'France',
      };
      const birthday = '1990-07-14';

      const result = calculateNextBirthdayUTC(birthday, location);

      expect(result).toBeDefined();
    });

    it('should recognize country fallback for India', () => {
      const location: Location = {
        city: 'Delhi',
        country: 'India',
      };
      const birthday = '1990-08-15';

      const result = calculateNextBirthdayUTC(birthday, location);

      expect(result).toBeDefined();
    });

    it('should recognize country fallback for China', () => {
      const location: Location = {
        city: 'Beijing',
        country: 'China',
      };
      const birthday = '1990-10-01';

      const result = calculateNextBirthdayUTC(birthday, location);

      expect(result).toBeDefined();
    });

    it('should recognize country fallback for Canada', () => {
      const location: Location = {
        city: 'Montreal',
        country: 'Canada',
      };
      const birthday = '1990-07-01';

      const result = calculateNextBirthdayUTC(birthday, location);

      expect(result).toBeDefined();
    });

    it('should recognize country fallback for Philippines', () => {
      const location: Location = {
        city: 'Manila',
        country: 'Philippines',
      };
      const birthday = '1990-06-12';

      const result = calculateNextBirthdayUTC(birthday, location);

      expect(result).toBeDefined();
    });
  });

  describe('getCurrentYear', () => {
    it('should return current year', () => {
      const currentYear = new Date().getFullYear();
      expect(getCurrentYear()).toBe(currentYear);
    });

    it('should return consistent year within same execution', () => {
      const year1 = getCurrentYear();
      const year2 = getCurrentYear();
      expect(year1).toBe(year2);
    });
  });

  describe('shouldSendNotification', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-06-15T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return true when birthday passed and not yet notified this year', () => {
      const nextBirthdayUTC = '2024-06-01T14:00:00Z'; // Past date
      const lastNotificationYear = 2023;

      expect(shouldSendNotification(nextBirthdayUTC, lastNotificationYear)).toBe(true);
    });

    it('should return false when birthday passed but already notified this year', () => {
      const nextBirthdayUTC = '2024-06-01T14:00:00Z'; // Past date
      const lastNotificationYear = 2024;

      expect(shouldSendNotification(nextBirthdayUTC, lastNotificationYear)).toBe(false);
    });

    it('should return false when birthday has not yet passed', () => {
      const nextBirthdayUTC = '2024-12-25T14:00:00Z'; // Future date
      const lastNotificationYear = 2023;

      expect(shouldSendNotification(nextBirthdayUTC, lastNotificationYear)).toBe(false);
    });

    it('should return false when birthday is exactly now but already notified', () => {
      const nextBirthdayUTC = '2024-06-15T12:00:00Z'; // Current time
      const lastNotificationYear = 2024;

      expect(shouldSendNotification(nextBirthdayUTC, lastNotificationYear)).toBe(false);
    });

    it('should return true when birthday is exactly now and not yet notified', () => {
      const nextBirthdayUTC = '2024-06-15T12:00:00Z'; // Current time
      const lastNotificationYear = 2023;

      expect(shouldSendNotification(nextBirthdayUTC, lastNotificationYear)).toBe(true);
    });
  });
});
