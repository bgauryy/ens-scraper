import { run } from "./src/runner";
import fs from "fs";
import path from "path";
import {
  AVAILABLE_FILE_NAME,
  PREMIUM_FILE_NAME,
  UNAVAILABLE_FILE_NAME,
} from "./src/constants";

process.setMaxListeners(0);

function getResultsList(filePath: string) {
  return fs
    .readFileSync(path.resolve(__dirname, filePath), {
      encoding: "utf-8",
    })
    .split("\n")
    .filter((val) => val)
    .map((val) => parseInt(val));
}

const takenDomains = getResultsList(UNAVAILABLE_FILE_NAME);
const availableDOmains = getResultsList(AVAILABLE_FILE_NAME);
const premiumDomains = getResultsList(PREMIUM_FILE_NAME);

const ethDomainsToCheck: string[] = [];
for (let i = 100; i < 200000; i++) {
  const value = i;
  if (
    !premiumDomains.includes(value) &&
    !takenDomains.includes(value) &&
    !availableDOmains.includes(value)
  ) {
    ethDomainsToCheck.push(String(value));
  }
}

run(ethDomainsToCheck);
