interface IFirstAndLastDayOfMonth {
  firstDay: Date;
  lastDay: Date;
}

/**
 * Enum for the days of the week
 */
enum WeekEnum {
  monday = "monday",
  tuesday = "tuesday",
  wednesday = "wednesday",
  thursday = "thursday",
  friday = "friday",
  saturday = "saturday",
  sunday = "sunday",
}

export interface IDayMonthYear {
  day: number;
  month: number;
  year: number;
  dayOfWeek: WeekEnum;
}

/**
 * OBJ that contains various types of conversion
 */
export class Converter {
  /**
   * Converts the standard Sped date string to Date
   * @example Receives 30062022 and returns the Date type
   * @returns returns the converted Date
   */
  public static spedDateToDate(date: string): Date {
    const day = date.substring(0, 2);
    const month = date.substring(2, 4);
    const year = date.substring(4);
    return new Date(`${month}/${day}/${year}`);
  }

  /**
   * Converts a string with , to number
   * @example string "1,22" to number 1.22
   */
  public static stringWithCommaToNumber(text: string): number {
    return parseFloat(text.replaceAll(",", "."));
  }

  /**
   * Rounds and removes decimal places beyond the size
   * @param number is the number to be rounded
   * @param size is the multiplication to be added
   * @example size = 100 and num = 10.12321 results in 10.12
   * @example size = 100 and num = 12.21921 results in 12.22
   */
  public static roundDecimalPlaces(num: number, size = 100): number {
    return Math.round(num * size) / size;
  }

  /**
   * Converts a number to a standard string with two decimal places
   * @example 1.213123 to "1,21"
   * @param number a number
   */
  public static numberToStringTwoDecimalPlaces(number: number): string {
    return this.roundDecimalPlaces(number).toString().replace(".", ",");
  }

  /**
   * Converts the number to a string with two decimal places
   * @example 12.1 to "12,10"
   * @example 5 to "5,00"
   * @example 12.2191 to "12,22"
   * @param number Number
   */
  public static toRealPattern(number: number): string {
    const text = this.numberToStringTwoDecimalPlaces(number || 0);

    if (text.indexOf(",") != -1) {
      if ((text.split(",").pop() as string).length == 1) return `${text}0`;
    } else {
      return `${text},00`;
    }
    return text;
  }

  /**
   * Converts the Date type to string
   * @example 2022-01-21T03:00:00.000Z to "21012022"
   * @example new Date("01012022") to "01012022"
   * @param date Date type
   * @returns returns the date ddmmyyyy
   */
  public static dateToString(date: Date): string {
    return `${this.addLeadingZeros(
      date.getUTCDate().toString(),
      "00"
    )}${this.addLeadingZeros(
      (date.getUTCMonth() + 1).toString(),
      "00"
    )}${date.getUTCFullYear().toString()}`;
  }

  /**
   * Converts day or month to the file pattern
   * @example "1" to "01"
   * @param info Date info
   */
  public static dayMonthPattern(info: string): string {
    return info.length == 1 ? `0${info}` : info;
  }

  /**
   * Merges the information
   * @param info information to be merged
   * @param size put how many zeros you want "0000"
   */
  public static addLeadingZeros(info: string, size: string): string {
    return (size + info).slice(size.length * -1);
  }

  /**
   * Adds zeros to the right
   * @param size zeros to be added
   */
  public static addTrailingZeros(info: string, size: number): string {
    if (info.indexOf(",") == -1) info = `${info},00`;

    const afterComma = info.split(",").pop() as string;

    const difference = size - afterComma.length;

    if (difference < 0)
      return this.roundDecimalPlaces(
        parseFloat(info.replaceAll(",", ".")),
        10 ** size
      )
        .toString()
        .replace(".", ",");

    return info.padEnd(info.length + difference, "0");
  }

  /**
   * Removes letters from the string
   */
  public static removeLetters(info: string): string {
    return info.replaceAll(/[^0-9]/g, "");
  }

  /**
   * State based on city code
   */
  public static stateBasedOnCityCode(cityCode: string): string {
    if (cityCode == "9999999") return "EX";
    const state = cityCode.substring(0, 2);
    if (state == "00") return "EX";

    switch (state) {
      case "35":
        return "SP";
      case "15":
        return "AC";
      case "27":
        return "AL";
      case "13":
        return "AM";
      case "29":
        return "BA";
      case "23":
        return "CE";
      case "53":
        return "DF";
      case "32":
        return "ES";
      case "52":
        return "GO";
      case "21":
        return "MA";
      case "51":
        return "MT";
      case "50":
        return "MS";
      case "31":
        return "MG";
      case "41":
        return "PR";
      case "26":
        return "PE";
      case "22":
        return "PI";
      case "33":
        return "RJ";
      case "24":
        return "RN";
      case "43":
        return "RS";
      case "11":
        return "RO";
      case "14":
        return "RR";
      case "42":
        return "SC";
      case "28":
        return "SE";
      case "17":
        return "TO";
    }

    return "SP";
  }

  /**
   * Trims the string to the desired length
   * @param data string to be trimmed
   * @param size length of the string
   * @example "1234567890" with size 5 results in "67890"
   */
  public static trimStringFromEnd(data: string, size: number): string {
    return data.substring(data.length - size);
  }

  /**
   * Creates a Date type without the time zone,
   * but with hour minute in zero
   * @param year
   * @param month
   * @param day
   * @param hour
   * @param minute
   * @param second
   * @returns
   */
  public static createDate(
    year?: number,
    month?: number,
    day?: number,
    hour?: number,
    minute?: number,
    second?: number
  ): Date {
    const localDate = new Date();

    year = typeof year == "number" ? year : localDate.getUTCFullYear();
    month = typeof month == "number" ? month : localDate.getUTCMonth();
    day = typeof day == "number" ? day : localDate.getUTCDate();
    hour = typeof hour == "number" ? hour : 0;
    minute = typeof minute == "number" ? minute : 0;
    second = typeof second == "number" ? second : 1;

    const a = new Date(year, month, day, hour, minute, second);
    const offset = a.getTimezoneOffset();
    const s = new Date(a.getTime() - offset * 60 * 1000);

    return s;
  }

  /**
   * Transforms a Date type into its first and last second of the month
   * @param date Selected date to capture
   * @returns An object with the data of the first and last second of the month
   * @example
   *         2022-01-21T03:00:00.000Z
   *         to
   *         #firstDay: 2022-01-01T03:00:00.000Z
   *         #lastDay: 2022-01-31T03:00:00.000Z
   */
  public static dateToFirstAndLastDayOfMonth(
    date: Date
  ): IFirstAndLastDayOfMonth {
    // Get the year, month, and day of the original date.
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();

    // Create a new date with the year, month, and day obtained in the previous step.
    const firstDayOfMonth = this.createDate(year, month, 1, 0, 0, 1);

    const lastDayOfMonth = this.createDate(year, month + 1, 0, 23, 59, 59);

    return {
      firstDay: firstDayOfMonth,
      lastDay: lastDayOfMonth,
    };
  }

  /**
   * Transforms a Date type into its first and last second of the year
   * @param date Selected date to capture
   * @returns An object with the data of the first and last day of the year
   * @example
   *         2022-01-21T03:00:00.000Z
   *         to
   *         #firstDay: 2022-01-01T03:00:00.000Z
   *         #lastDay: 2022-12-31T03:00:00.000Z
   */
  public static dateToFirstAndLastDayOfYear(date: Date): {
    lastDay: Date;
    firstDay: Date;
    months: {
      jan: IFirstAndLastDayOfMonth;
      feb: IFirstAndLastDayOfMonth;
      mar: IFirstAndLastDayOfMonth;
      apr: IFirstAndLastDayOfMonth;
      may: IFirstAndLastDayOfMonth;
      jun: IFirstAndLastDayOfMonth;
      jul: IFirstAndLastDayOfMonth;
      aug: IFirstAndLastDayOfMonth;
      sep: IFirstAndLastDayOfMonth;
      oct: IFirstAndLastDayOfMonth;
      nov: IFirstAndLastDayOfMonth;
      dec: IFirstAndLastDayOfMonth;
    };
  } {
    // Get the year, month, and day of the original date.
    const year = date.getUTCFullYear();
    // const month = date.getUTCMonth();

    // Create a new date with the year, month, and day obtained in the previous step.
    const firstDayOfYear = this.createDate(year, 0, 1, 0, 0, 1);

    const lastDayOfYear = this.createDate(year + 1, 0, -1, 20, 59, 59);

    const months = {
      jan: this.dateToFirstAndLastDayOfMonth(this.createDate(year, 0, 15)),
      feb: this.dateToFirstAndLastDayOfMonth(this.createDate(year, 1, 15)),
      mar: this.dateToFirstAndLastDayOfMonth(this.createDate(year, 2, 15)),
      apr: this.dateToFirstAndLastDayOfMonth(this.createDate(year, 3, 15)),
      may: this.dateToFirstAndLastDayOfMonth(this.createDate(year, 4, 15)),
      jun: this.dateToFirstAndLastDayOfMonth(this.createDate(year, 5, 15)),
      jul: this.dateToFirstAndLastDayOfMonth(this.createDate(year, 6, 15)),
      aug: this.dateToFirstAndLastDayOfMonth(this.createDate(year, 7, 15)),
      sep: this.dateToFirstAndLastDayOfMonth(this.createDate(year, 8, 15)),
      oct: this.dateToFirstAndLastDayOfMonth(this.createDate(year, 9, 15)),
      nov: this.dateToFirstAndLastDayOfMonth(this.createDate(year, 10, 15)),
      dec: this.dateToFirstAndLastDayOfMonth(this.createDate(year, 11, 15)),
    };

    return {
      firstDay: firstDayOfYear,
      lastDay: lastDayOfYear,
      months,
    };
  }

  /**
   * Searches for the current day of the week
   * @returns
   */
  public static dayOfWeek(dayInput?: Date): WeekEnum {
    const date = dayInput ? dayInput : this.createDate();
    const day = date.getUTCDay();

    switch (day) {
      case 0:
        return WeekEnum.sunday;
      case 1:
        return WeekEnum.monday;
      case 2:
        return WeekEnum.tuesday;
      case 3:
        return WeekEnum.wednesday;
      case 4:
        return WeekEnum.thursday;
      case 5:
        return WeekEnum.friday;
      case 6:
        return WeekEnum.saturday;
    }

    throw new Error("Day of the week not found");
  }

  /**
   * Searches for the next days of the current month counting the next
   */
  public static nextDaysOfMonth(
    numberOfDays: number,
    date?: Date
  ): IDayMonthYear[] {
    const day1 = date ? date : this.createDate();

    const days: IDayMonthYear[] = [
      {
        day: day1.getUTCDate(),
        month: day1.getUTCMonth() + 1,
        year: day1.getUTCFullYear(),
        dayOfWeek: this.dayOfWeek(day1),
      },
    ];

    let a = 0;
    while (a < numberOfDays - 1) {
      day1.setUTCDate(day1.getUTCDate() + 1);
      days.push({
        day: day1.getUTCDate(),
        month: day1.getUTCMonth() + 1,
        year: day1.getUTCFullYear(),
        dayOfWeek: this.dayOfWeek(day1),
      });
      a++;
    }

    return days;
  }

  /**
   * Converts a Date type to YYYY-MM-DD
   * @param date Date type
   * @example 2022-01-21T03:00:00.000Z to "2022-01-21"
   */
  public static dateToStringWithDashes(date: Date): string {
    return `${date.getUTCFullYear()}-${this.dayMonthPattern(
      (date.getUTCMonth() + 1).toString()
    )}-${this.dayMonthPattern(date.getUTCDate().toString())}`;
  }
}
