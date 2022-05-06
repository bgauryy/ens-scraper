import fs from "fs";
import BrowserPool from "./src/BrowserPool";

const browsersPoolSize = 4;
const pagesLimit = 5;
const CHUNK = browsersPoolSize * pagesLimit;
const TAKENFILE = "n-taken.txt";
const FREEDOMAINFILE = "n-available.txt";

process.setMaxListeners(0);

const takenDomains = fs.readFileSync(TAKENFILE, { encoding: "utf-8" });
const availableDOmains = fs.readFileSync(FREEDOMAINFILE, { encoding: "utf-8" });

const arr: string[] = [];
for (let i = 100000; i > 30000; i--) {
  arr.push(`${i}`);
}

run(arr);

async function run(arr: string[]) {
  console.log(`ChunkSize ${CHUNK}`);
  const pagesPool = new BrowserPool(browsersPoolSize);
  let lastTime = Date.now();

  async function loop() {
    const promises = [];
    for (let i = 0; i < CHUNK; i++) {
      promises.push(checkDomain(pagesPool, arr.shift()));
    }
    await Promise.all(promises);
    const now = Date.now();
    const chunkTime = (now - lastTime) / 1000;
    console.log(`Chunk time ${chunkTime}, ${chunkTime / CHUNK} per check`);
    lastTime = now;
    if (arr.length > 0) {
      await loop();
    }
  }
  await loop();
}
async function checkDomain(pagesPool: BrowserPool, check: string) {
  if (
    !check ||
    takenDomains.includes(check) ||
    availableDOmains.includes(check)
  ) {
    return;
  }

  const page = await pagesPool.getPage();
  await page.goto(`https://app.ens.domains/search/${check}`, {
    waitUntil: ["domcontentloaded", "networkidle0"],
  });
  await page.waitForSelector(`[data-testid="domain-${check}.eth"]`);
  await page.waitForXPath('//div[contains(text(), "singleName.domain.state")]');

  const isAvailable = await page.evaluate(() => {
    return document.body.innerHTML.includes(
      "singleName.domain.state.available"
    );
  });

  if (isAvailable) {
    fs.appendFileSync(FREEDOMAINFILE, `${check}\n`);
  } else {
    fs.appendFileSync(TAKENFILE, `${check}\n`);
  }
  await page.close();
}
