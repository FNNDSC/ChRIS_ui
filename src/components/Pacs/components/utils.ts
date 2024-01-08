import { parse, format } from "date-fns";

export const formatStudyDate = (studyDateString: string) => {
  // Parse the input string to a Date object
  const parsedDate = parse(studyDateString, "yyyyMMdd", new Date());

  // Format the Date object to 'MMMM d yyyy' format (e.g., 'December 6 2011')
  const formattedDate = format(parsedDate, "MMMM d yyyy");

  // Add 'st', 'nd', 'rd', or 'th' to the day part of the formatted date
  const day: any = format(parsedDate, "d");
  const dayWithSuffix =
    day +
    (["st", "nd", "rd"][
      (day - 1) % 10 === 0
        ? 0
        : (day - 11) % 10 === 0
          ? 1
          : (day - 12) % 10 === 0
            ? 2
            : 3
    ] || "th");

  return formattedDate.replace(day, dayWithSuffix);
};
