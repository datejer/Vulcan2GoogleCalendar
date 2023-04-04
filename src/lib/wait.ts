export const wait = (ms: number = 3000) =>
  new Promise((r) => setTimeout(r, ms));
