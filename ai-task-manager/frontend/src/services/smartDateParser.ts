// Smart Date Parser Service
// Natural language date parsing for task due dates

export interface ParsedDate {
  date: Date;
  confidence: number;
  originalText: string;
  parsedText: string;
}

export class SmartDateParser {
  private static now(): Date {
    return new Date();
  }

  // Time keywords
  private static readonly TIME_PATTERNS = {
    morning: 9,
    afternoon: 14,
    evening: 18,
    night: 20,
    noon: 12,
    midnight: 0,
  };

  // Relative day patterns
  private static readonly DAY_PATTERNS = {
    today: 0,
    tomorrow: 1,
    "day after tomorrow": 2,
    "next week": 7,
    "next month": 30,
  };

  // Weekday names
  private static readonly WEEKDAYS = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  // Month names
  private static readonly MONTHS = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];

  static parseFromText(text: string): ParsedDate | null {
    const lowercaseText = text.toLowerCase().trim();

    // Try different parsing strategies
    const parsers = [
      this.parseRelativeDays,
      this.parseWeekdays,
      this.parseTimeExpressions,
      this.parseExactDates,
      this.parseInXDays,
      this.parseMonthDay,
    ];

    for (const parser of parsers) {
      const result = parser.call(this, lowercaseText);
      if (result) {
        return result;
      }
    }

    return null;
  }

  private static parseRelativeDays(text: string): ParsedDate | null {
    for (const [keyword, days] of Object.entries(this.DAY_PATTERNS)) {
      if (text.includes(keyword)) {
        const base = this.now();
        const date = new Date(base.getTime());
        date.setDate(date.getDate() + days);

        return {
          date,
          confidence: 0.9,
          originalText: text,
          parsedText: keyword,
        };
      }
    }
    return null;
  }

  private static parseWeekdays(text: string): ParsedDate | null {
    for (let i = 0; i < this.WEEKDAYS.length; i++) {
      const weekday = this.WEEKDAYS[i];

      if (text.includes(weekday)) {
        const today = this.now().getDay();
        const targetDay = i;
        let daysUntil = targetDay - today;

        // If the day has passed this week, target next week
        if (daysUntil <= 0) {
          daysUntil += 7;
        }

        const base = this.now();
        const date = new Date(base.getTime());
        date.setDate(date.getDate() + daysUntil);

        // Check for "next [weekday]" pattern
        const isNext = text.includes("next " + weekday);
        if (isNext && daysUntil <= 7) {
          date.setDate(date.getDate() + 7);
        }

        return {
          date,
          confidence: 0.8,
          originalText: text,
          parsedText: `${isNext ? "next " : ""}${weekday}`,
        };
      }
    }
    return null;
  }

  private static parseTimeExpressions(text: string): ParsedDate | null {
    // Look for time keywords
    for (const [timeKeyword, hour] of Object.entries(this.TIME_PATTERNS)) {
      if (text.includes(timeKeyword)) {
        const base = this.now();
        const date = new Date(base.getTime());
        date.setHours(hour, 0, 0, 0);

        // If time has passed today, set for tomorrow
        if (date < base) {
          date.setDate(date.getDate() + 1);
        }

        return {
          date,
          confidence: 0.7,
          originalText: text,
          parsedText: timeKeyword,
        };
      }
    }
    return null;
  }

  private static parseInXDays(text: string): ParsedDate | null {
    const patterns = [
      /in (\d+) days?/,
      /(\d+) days? from now/,
      /after (\d+) days?/,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const days = parseInt(match[1]);
        const base = this.now();
        const date = new Date(base.getTime());
        date.setDate(date.getDate() + days);

        return {
          date,
          confidence: 0.9,
          originalText: text,
          parsedText: `in ${days} day${days === 1 ? "" : "s"}`,
        };
      }
    }
    return null;
  }

  private static parseExactDates(text: string): ParsedDate | null {
    // Handle formats like "March 15", "3/15", "15th"
    const datePatterns = [
      /(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/, // MM/DD or MM/DD/YYYY
      /(\d{1,2})-(\d{1,2})(?:-(\d{2,4}))?/, // MM-DD or MM-DD-YYYY
      /(\d{1,2})(?:st|nd|rd|th)/, // 15th, 1st, 2nd, 3rd
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        try {
          let date: Date;

          if (match[0].includes("/") || match[0].includes("-")) {
            // Date format MM/DD or MM/DD/YYYY
            const month = parseInt(match[1]) - 1;
            const day = parseInt(match[2]);
            const base = this.now();
            const year = match[3] ? parseInt(match[3]) : base.getFullYear();
            date = new Date(year, month, day);
          } else {
            // Day of month (e.g., "15th")
            const base = this.now();
            const day = parseInt(match[1]);
            date = new Date(base.getFullYear(), base.getMonth(), day);

            // If date has passed this month, set for next month
            if (date < base) {
              date.setMonth(date.getMonth() + 1);
            }
          }

          return {
            date,
            confidence: 0.8,
            originalText: text,
            parsedText: match[0],
          };
        } catch {
          continue;
        }
      }
    }
    return null;
  }

  private static parseMonthDay(text: string): ParsedDate | null {
    // Handle "March 15", "Jan 1st", etc.
    for (let i = 0; i < this.MONTHS.length; i++) {
      const month = this.MONTHS[i];
      const shortMonth = month.substring(0, 3);

      if (text.includes(month) || text.includes(shortMonth)) {
        const dayMatch = text.match(/(\d{1,2})(?:st|nd|rd|th)?/);
        if (dayMatch) {
          const day = parseInt(dayMatch[1]);
          const base = this.now();
          const date = new Date(base.getFullYear(), i, day);

          // If date has passed this year, set for next year
          if (date < base) {
            date.setFullYear(date.getFullYear() + 1);
          }

          return {
            date,
            confidence: 0.85,
            originalText: text,
            parsedText: `${month} ${day}`,
          };
        }
      }
    }
    return null;
  }

  // Extract due date from task description
  static extractDueDateFromDescription(description: string): {
    cleanDescription: string;
    dueDate: Date | null;
    confidence: number;
  } {
    const parsed = this.parseFromText(description);

    if (parsed && parsed.confidence > 0.6) {
      // Remove the date text from description
      const cleanDescription = description
        .replace(new RegExp(parsed.parsedText, "gi"), "")
        .replace(/\s+/g, " ")
        .trim();

      return {
        cleanDescription,
        dueDate: parsed.date,
        confidence: parsed.confidence,
      };
    }

    return {
      cleanDescription: description,
      dueDate: null,
      confidence: 0,
    };
  }

  // Get human-readable relative time
  static getRelativeTimeString(date: Date): string {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === -1) return "Yesterday";
    if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
    if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;

    return date.toLocaleDateString();
  }

  // Check if date is approaching (for notifications)
  static isDateApproaching(date: Date, hoursThreshold: number = 24): boolean {
    const now = new Date();
    const diffHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours > 0 && diffHours <= hoursThreshold;
  }
}
