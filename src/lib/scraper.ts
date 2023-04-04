import puppeteer, { ElementHandle, Page } from "puppeteer";
import { wait } from "./wait";

export const newPage = async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  return { page, browser };
};

export const navigateLogin = async (page: Page) => {
  await page.goto("https://uonetplus.vulcan.net.pl/poznan/");
  await page.click(".loginButton");

  await wait();
};

export const login = async (
  page: Page,
  { email, password }: { email?: string; password?: string }
) => {
  await page.type("#LoginName", email || process.env.EMAIL || "");
  await page.type("#Password", password || process.env.PASSWORD || "");
  await page.click(".LogOnBoard input[type='submit']");

  await wait();
};

export const navigateDashboard = async (page: Page) => {
  await page.goto(
    "https://uonetplus-uczen.vulcan.net.pl/poznan/000088/LoginEndpoint.aspx"
  );

  await wait();
};

export const navigatePlan = async (page: Page) => {
  await page.click("text/Plan zajęć");

  await wait();
};

export const getTimetable = async (page: Page) => {
  const table = await page.waitForSelector("table[id='ext-vdynamicgrid-1']");

  return table;
};
