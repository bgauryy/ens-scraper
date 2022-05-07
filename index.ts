import { run } from "./src/runner";

process.setMaxListeners(0);

const ethDomainsToCheck: string[] = [];
for (let i = 30000; i < 100000; i++) {
  ethDomainsToCheck.push(`${i}`);
}

run(ethDomainsToCheck);
