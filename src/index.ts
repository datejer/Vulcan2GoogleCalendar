import * as dotenv from "dotenv";
dotenv.config();
import {
  getTimetable,
  login,
  navigateDashboard,
  navigateLogin,
  navigatePlan,
  newPage,
} from "./lib/scraper";
import { getFullBlocks, parseTimetable } from "./lib/parser";
import { authorize, markBlocksInCalendar } from "./lib/google";

async function main() {
  authorize()
    .then(async (auth) => {
      if (!process.env.EMAIL || !process.env.PASSWORD) {
        throw new Error(
          "Missing credentials EMAIL and PASSWORD in .env. Refer to .env.example."
        );
      }

      const { page, browser } = await newPage();

      await navigateLogin(page);
      await login(page, {
        email: process.env.EMAIL,
        password: process.env.PASSWORD,
      });
      await navigateDashboard(page);
      await navigatePlan(page);
      const rawTable = await getTimetable(page);
      if (!rawTable) throw new Error("No timetable found");
      const timetable = await parseTimetable(rawTable);
      const fullTimeBlocks = getFullBlocks(timetable);
      await markBlocksInCalendar(auth, fullTimeBlocks);

      await browser.close();
    })
    .catch(console.error);
}
main();
