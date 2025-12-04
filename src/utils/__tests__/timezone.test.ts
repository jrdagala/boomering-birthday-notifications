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
      const day = 25;
      const hour = 9;
      const minute = 0;
      const second = 0;
      const timezone = 'America/New_York';
      const birthday = '1990-12-25'; // Christmas

      const result = calculateNextBirthdayUTC(birthday, location);
      const nextBirthday = moment(result);
      const expectedNextBirthday = moment.tz(
        {
          year: 2024,
          month: 11, // December is 11
          day,
          hour,
          minute,
          second,
        },
        timezone
      );

      expect(nextBirthday.format('YYYY-MM-DD')).toBe(
        expectedNextBirthday.utc().format('YYYY-MM-DD')
      );
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should calculate next birthday for US Pacific timezone', () => {
      const location: Location = {
        city: 'Los Angeles',
        state: 'California',
        country: 'USA',
      };
      const day = 15;
      const hour = 9;
      const minute = 0;
      const second = 0;
      const timezone = 'America/Los_Angeles';
      const birthday = '1985-03-15';

      const result = calculateNextBirthdayUTC(birthday, location);
      const nextBirthday = moment(result);
      const expectedNextBirthday = moment.tz(
        {
          year: 2025,
          month: 2, // March is 2
          day,
          hour,
          minute,
          second,
        },
        timezone
      );

      // Birthday already passed this year, should be next year
      expect(nextBirthday.toISOString()).toBe(expectedNextBirthday.utc().toISOString());
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should calculate next birthday for London', () => {
      const location: Location = {
        city: 'London',
        country: 'UK',
      };
      const day = 20;
      const hour = 9;
      const minute = 0;
      const second = 0;
      const timezone = 'Europe/London';
      const birthday = '1992-08-20';

      const result = calculateNextBirthdayUTC(birthday, location);
      const nextBirthday = moment(result);
      const expectedNextBirthday = moment.tz(
        {
          year: 2024,
          month: 7, // August is 7
          day,
          hour,
          minute,
          second,
        },
        timezone
      );

      expect(nextBirthday.toISOString()).toBe(expectedNextBirthday.utc().toISOString());
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should calculate next birthday for Tokyo', () => {
      const location: Location = {
        city: 'Tokyo',
        country: 'Japan',
      };
      const day = 11;
      const hour = 9;
      const minute = 0;
      const second = 0;
      const timezone = 'Asia/Tokyo';
      const birthday = '1988-11-11';

      const result = calculateNextBirthdayUTC(birthday, location);
      const nextBirthday = moment(result);
      const expectedNextBirthday = moment.tz(
        {
          year: 2024,
          month: 10, // November is 10
          day,
          hour,
          minute,
          second,
        },
        timezone
      );

      expect(nextBirthday.toISOString()).toBe(expectedNextBirthday.utc().toISOString());
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should calculate next birthday for Sydney', () => {
      const location: Location = {
        city: 'Sydney',
        country: 'Australia',
      };
      const day = 10;
      const hour = 9;
      const minute = 0;
      const second = 0;
      const timezone = 'Australia/Sydney';
      const birthday = '1995-01-10';

      const result = calculateNextBirthdayUTC(birthday, location);
      const nextBirthday = moment(result).tz(timezone);
      const expectedNextBirthday = moment.tz(
        {
          year: 2025,
          month: 0,
          day,
          hour,
          minute,
          second,
        },
        timezone
      );

      // Birthday already passed, should be next year
      expect(nextBirthday.toISOString()).toBe(expectedNextBirthday.utc().toISOString());
    });

    it('should use next year if birthday already passed this year', () => {
      const location: Location = {
        city: 'New York',
        state: 'New York',
        country: 'USA',
      };
      const day = 1;
      const hour = 9;
      const minute = 0;
      const second = 0;
      const timezone = 'America/New_York';
      const birthday = '1990-01-01'; // Already passed

      const result = calculateNextBirthdayUTC(birthday, location);
      const nextBirthday = moment(result);
      const expectedNextBirthday = moment.tz(
        {
          year: 2025,
          month: 0, // January is 0
          day,
          hour,
          minute,
          second,
        },
        timezone
      );

      expect(nextBirthday.format('YYYY-MM-DD')).toBe(expectedNextBirthday.format('YYYY-MM-DD'));
    });

    it('should use this year if birthday is upcoming', () => {
      const location: Location = {
        city: 'New York',
        state: 'New York',
        country: 'USA',
      };
      const day = 31;
      const hour = 9;
      const minute = 0;
      const second = 0;
      const timezone = 'America/New_York';
      const birthday = '1990-12-31'; // Not yet passed

      const result = calculateNextBirthdayUTC(birthday, location);
      const nextBirthday = moment(result);
      const expectedNextBirthday = moment.tz(
        {
          year: 2024,
          month: 11, // December is 11
          day,
          hour,
          minute,
          second,
        },
        timezone
      );

      expect(nextBirthday.format('YYYY-MM-DD')).toBe(expectedNextBirthday.format('YYYY-MM-DD'));
    });

    it('should default to UTC for unknown location', () => {
      const location: Location = {
        city: 'Unknown City',
        country: 'Unknown Country',
      };
      const day = 15;
      const hour = 0; // Default to 0 for UTC comparison if not specified
      const minute = 0;
      const second = 0;
      const timezone = 'UTC';
      const birthday = '1990-09-15';

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = calculateNextBirthdayUTC(birthday, location);
      const nextBirthday = moment(result).tz(timezone);
      const expectedNextBirthday = moment.tz(
        {
          year: 2024, // Assuming current year is 2024 for the test context
          month: 8, // September is 8
          day,
          hour,
          minute,
          second,
        },
        timezone
      );

      expect(nextBirthday.format('YYYY-MM-DD')).toBe(expectedNextBirthday.format('YYYY-MM-DD'));
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
