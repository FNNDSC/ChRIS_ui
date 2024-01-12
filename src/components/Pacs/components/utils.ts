import { parse, format } from "date-fns";

export const formatStudyDate = (studyDateString: string) => {
  // Parse the input string to a Date object
  const parsedDate = parse(studyDateString, "yyyyMMdd", new Date());

  // Format the Date object to 'MMMM d yyyy' format (e.g., 'December 6 2011')
  const formattedDate = format(parsedDate, "MMMM d yyyy");

  // Determine the day part of the formatted date
  const day: any = format(parsedDate, "d");

  // Add 'st', 'nd', 'rd', or 'th' to the day part of the formatted date
  const dayWithSuffix = getDayWithSuffix(day);

  return formattedDate.replace(day, dayWithSuffix);
};

const getDayWithSuffix = (day: number) => {
  if (day >= 11 && day <= 13) {
    return day + "th";
  }

  const lastDigit = day % 10;

  switch (lastDigit) {
    case 1:
      return day + "st";
    case 2:
      return day + "nd";
    case 3:
      return day + "rd";
    default:
      return day + "th";
  }
};