import { run } from "./src/runner";
import fs from "fs";
import path from "path";
import { AVAILABLE_FILE_NAME, UNAVAILABLE_FILE_NAME } from "./src/constants";

process.setMaxListeners(0);

const takenDomains = fs
  .readFileSync(path.resolve(__dirname, UNAVAILABLE_FILE_NAME), {
    encoding: "utf-8",
  })
  .split("\n")
  .filter((val) => val)
  .map((val) => parseInt(val));

const availableDOmains = fs
  .readFileSync(path.resolve(__dirname, AVAILABLE_FILE_NAME), {
    encoding: "utf-8",
  })
  .split("\n")
  .filter((val) => val)
  .map((val) => parseInt(val));

const ethDomainsToCheck: string[] = [];
for (let i = 10000; i < 150000; i++) {
  const value = i;
  if (!takenDomains.includes(value) && !availableDOmains.includes(value)) {
    ethDomainsToCheck.push(String(value));
  }
}

run(ethDomainsToCheck);
