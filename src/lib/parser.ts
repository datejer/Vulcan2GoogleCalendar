import { ElementHandle } from "puppeteer";

type Lesson = {
  from: string;
  to: string;
  text: string;
};

type Timetable = { [key: string]: Lesson[] };

export const parseTimetable = async (
  table: ElementHandle<HTMLTableElement>
) => {
  const tableHeaders = await table.$$eval("table th", (headers) =>
    headers.map((header) => header.textContent?.trim() || "")
  );

  const headersWithoutLabel = tableHeaders.slice(1);

  const tableRows = await table.$$eval("table tr", (rows) =>
    rows.map((row) =>
      Array.from(row.querySelectorAll("td")).map(
        (cell) => cell.textContent?.trim() || ""
      )
    )
  );

  const rowLabels = tableRows.map((row) => row[0]);
  const rowsWithoutLabel = tableRows.map((row) => row.slice(1));

  const timetableByDay = rowsWithoutLabel.reduce((acc, row, rowIndex) => {
    row.forEach((cell, index) => {
      if (!acc[index]) {
        acc[index] = [];
      }

      // 10:2512:45
      const fromto = rowLabels[rowIndex].match(/.{10}$/g);

      const from = fromto?.[0].slice(0, 5);
      const to = fromto?.[0].slice(5, 10);

      acc[index].push({
        from: from || "",
        to: to || "",
        text: cell,
      });
    });

    return acc;
  }, [] as Lesson[][]);

  const timetable = headersWithoutLabel.reduce((acc, header, index) => {
    const onlyDate = header.match(/\d{1,2}[\,\.]{1}\d{1,2}[\,\.]{1}\d{1,4}/g);
    const split = onlyDate?.[0].split(".");
    const [day, month, year] = split || "";
    const date = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day) + 1
    );
    const dateString = date.toISOString().split("T")[0];

    acc[dateString] = timetableByDay[index];

    return acc;
  }, {} as Timetable);

  return timetable;
};

export type FullBlock = {
  date: string;
  from: string;
  to: string;
};

export const getFullBlocks = (timetable: Timetable): FullBlock[] => {
  const fullBlocks =
    Object.keys(timetable).flatMap((key) => {
      const lessons = timetable[key];

      const firstLesson = lessons.find((lesson) => lesson.text !== "");
      const lastLesson = lessons.reverse().find((lesson) => lesson.text !== "");

      if (!firstLesson || !lastLesson) return [];

      return {
        date: key,
        from: firstLesson.from,
        to: lastLesson.to,
      };
    }) || [];

  return fullBlocks;
};
