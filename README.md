# Vulcan2GoogleCalendar

This is a simple script to synchronize the timetable from the Vulcan school register with your Google Calendar.

Adding entire blocks from the start of first lesson to the end of the last lesson, which indicate you are out of office
and block your calendar for meetings.

## Usage

### Prerequisites

- Node.js (tested with v18.15.0)
- A Vulcan account
- A Google account with a calendar
- A Google Cloud project with the Google Calendar API enabled
  - Follow this guide to create one https://developers.google.com/calendar/api/quickstart/js
  - Remember to add the correct intents to the OAuth consent screen

### Installation

1. Clone this repository
2. Run `yarn install`
3. Add a `.env` file following the `.env.example`
4. Add a `credentials.json` file generated by the Google Cloud Console in the root directory
5. Customize `config.ts` to your needs
6. Run `yarn start` to synchronize your calendar once

### Cronjob

Coming soon...
