// GOOGLE CALENDAR API EXAMPLE

const fs = require("fs").promises;
const path = require("path");
const { authenticate } = require("@google-cloud/local-auth");
const { google } = require("googleapis");
import { formatRFC3339 } from "date-fns";
import { FullBlock } from "./parser";
import { config } from "../config";

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/calendar.events"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), "token.json");
const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");

const MINUTE = 60 * 1000;

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
export async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
export async function saveCredentials(client: any) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: "authorized_user",
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
export async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
export async function listEvents(auth: any) {
  const calendar = google.calendar({ version: "v3", auth });
  const res = await calendar.events.list({
    calendarId: "primary",
    timeMin: new Date().toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: "startTime",
  });
  const events = res.data.items;
  if (!events || events.length === 0) {
    console.log("No upcoming events found.");
    return;
  }
  console.log("Upcoming 10 events:");
  events.map((event: any, i: any) => {
    const start = event.start.dateTime || event.start.date;
    console.log(`${start} - ${event.summary}`);
  });
}

export async function markBlocksInCalendar(auth: any, blocks: FullBlock[]) {
  try {
    const calendar = google.calendar({ version: "v3", auth });

    const { data } = await calendar.events.list({
      calendarId: "primary",
      q: "Vulcan2GoogleCalendar",
      singleEvents: true,
      orderBy: "startTime",
    });
    const events = data.items;

    if (events && events.length > 0) {
      events.map(async (event: any) => {
        await calendar.events.delete({
          calendarId: "primary",
          eventId: event.id,
        });
      });
    }

    const PADDING = MINUTE * config.eventPadding;

    blocks.map((block) => {
      const startDate = new Date(block.date + "T" + block.from);
      const offsetStartDate = new Date(startDate.getTime() - PADDING);
      const start = formatRFC3339(offsetStartDate);

      const endDate = new Date(block.date + "T" + block.to);
      const offsetEndDate = new Date(endDate.getTime() + PADDING);
      const end = formatRFC3339(offsetEndDate);

      calendar.events.insert(
        {
          auth: auth,
          calendarId: "primary",
          requestBody: {
            start: {
              dateTime: start,
              timeZone: "Europe/Warsaw",
            },
            end: {
              dateTime: end,
              timeZone: "Europe/Warsaw",
            },
            summary: "School 👨🏻‍🎓",
            description:
              "Event automatically synced from school timetable by Vulcan2GoogleCalendar",
            eventType: "outOfOffice", // read-only field :( please +1 https://issuetracker.google.com/issues/206630110?pli=1
            visibility: config.eventVisibility || "public",
            transparency: config.eventTransparency || "opaque",
          },
        },
        function (err: any, something: any) {
          if (err) {
            console.log(err);
          } else {
            console.log(something);
          }
        }
      );
    });
  } catch (err) {
    console.log(err);
  }
}
