import { run } from "./src/runner";

process.setMaxListeners(0);

const ethDomainsToCheck: string[] = [];
for (let i = 10000; i < 150000; i++) {
  ethDomainsToCheck.push(`${i}`);
}

run(ethDomainsToCheck);
