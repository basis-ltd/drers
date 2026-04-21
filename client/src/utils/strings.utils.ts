import moment from "moment";

/**
 * FORMAT DATE
 * @param date - The date to format
 * @param format - The format to use
 * @returns The formatted date
 */
export const formatDate = (
  date: string | Date | undefined,
  format: string = "YYYY-MM-DD",
) => {
  if (!date) return "";
  return moment(date).format(format);
};

/**
 * FORMAT TIME
 * @param time - The time to format
 * @param format - The format to use
 * @returns The formatted time
 */
export const formatTime = (
  time: string | Date | undefined,
  format: string = "HH:mm:ss",
) => {
  if (!time) return "";
  return moment(time, format).format(format);
};

/**
 * CAPITALIZE STRING
 * @param string - The string to capitalize
 * @returns The capitalized string
 */
export const capitalizeString = (
  string: string | undefined | null | number,
) => {
  if (!string || typeof string !== "string") return "";
  const isCamelCase = /^[a-z]+([A-Z][a-z]*)*$/.test(string);
  if (isCamelCase) return capitalizeCamelCase(string);
  if (
    string.includes("@") ||
    string.includes("true") ||
    string.includes("false")
  )
    return string; // Avoid capitalizing email addresses and boolean values
  const words = string?.toLowerCase()?.split("_");
  const capitalizedWords =
    words && words.map((word) => word.charAt(0).toUpperCase() + word.slice(1));
  return capitalizedWords && capitalizedWords.join(" ");
};

/**
 * CAPITALIZE CAMEL CASE
 * @param string - The string to capitalize
 * @returns The capitalized string
 */
export function capitalizeCamelCase(string: string) {
  return string
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, function (str) {
      return str.toUpperCase();
    })
    .trim();
}

/**
 * FORMAT NUMBERS
 * @param number - The number to format
 * @returns The formatted number
 */
export const formatNumbers = (number?: number | string) => {
  if (number === undefined || number === null || number === "") return "";
  return new Intl.NumberFormat().format(Number(number));
};
