import { run } from "./src/runner";

process.setMaxListeners(0);

const arr: string[] = [];
for (let i = 100000; i > 30000; i--) {
  arr.push(`${i}`);
}

run(arr);
