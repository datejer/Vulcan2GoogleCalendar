export const config = {
  // Should puppeteer run in headless mode?
  headless: false,

  // Symbol of the Vulcan instance. Usually it's the name of the city / area.
  // You can find it in your URL (e.g. https://uonetplus.vulcan.net.pl/poznan/)
  vulcanSymbol: "poznan",

  // Should the calendar event names be visible to everyone? (private or public)
  eventVisibility: "public",
  // Should the calendar event be marked as "busy"? (opaque or transparent)
  eventTransparency: "opaque",
  // How much padding should be added to the beginning and end of the School block (in minutes)? (for transport, etc.)
  eventPadding: 30,
};
