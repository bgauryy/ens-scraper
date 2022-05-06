import fs from "fs";
import path from "path";
import BrowserPool from "./BrowserPool";

//TODO - move 'browsersPoolSize' 'pagesLimit' to params
const browsersPoolSize = 5;
const pagesLimit = 7;
const CHUNK = browsersPoolSize * pagesLimit;
const TAKENFILE = "n-taken.txt";
const FREEDOMAINFILE = "n-available.txt";
const takenDomains = fs.readFileSync(
  path.resolve(__dirname, "../", TAKENFILE),
  {
    encoding: "utf-8",
  }
);
const availableDOmains = fs.readFileSync(
  path.resolve(__dirname, "../", FREEDOMAINFILE),
  { encoding: "utf-8" }
);

export async function run(arr: string[]) {
  console.log(`ChunkSize ${CHUNK}`);
  const pagesPool = new BrowserPool(browsersPoolSize);
  let lastTime = Date.now();

  async function loop() {
    const promises = [];
    for (let i = 0; i < CHUNK; i++) {
      const value = arr.shift();
      if (value) {
        promises.push(checkDomain(pagesPool, value));
      }
    }
    await Promise.all(promises);
    const now = Date.now();
    const chunkTime = (now - lastTime) / 1000;
    if (chunkTime > 1) {
      console.log(
        `Chunk time ${chunkTime}, ${(chunkTime / CHUNK).toFixed(2)} per check`
      );
    }
    lastTime = now;
    if (arr.length > 0) {
      await loop();
    }
  }
  await loop();
}
async function checkDomain(pagesPool: BrowserPool, value: string) {
  if (
    !value ||
    takenDomains.includes(value) ||
    availableDOmains.includes(value)
  ) {
    return;
  }

  const page = await pagesPool.getPage();
  await page.goto(`https://app.ens.domains/search/${value}`, {
    waitUntil: ["domcontentloaded", "networkidle0"],
  });
  await page.waitForXPath('//div[contains(text(), "singleName.domain.state")]');

  const isAvailable = await page.evaluate(() => {
    return document.body.innerHTML.includes(
      "singleName.domain.state.available"
    );
  });

  if (isAvailable) {
    fs.appendFileSync(FREEDOMAINFILE, `${value}\n`);
  } else {
    fs.appendFileSync(TAKENFILE, `${value}\n`);
  }
  await page.close();
}
