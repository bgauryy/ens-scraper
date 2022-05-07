import fs from "fs";
import BrowserPool from "./BrowserPool";
import {
  BROWSER_POOL_SIZE,
  CHUNK,
  FREEDOMAINFILE,
  TAKENFILE,
} from "./constants";

export async function run(arr: string[]) {
  const inititalLength = arr.length;
  let checks = 0;
  const browserPool = new BrowserPool(BROWSER_POOL_SIZE);
  let lastTime = Date.now();

  console.log(`Chunk Size ${CHUNK} | Check ${inititalLength}`);

  async function loop() {
    const promises = [];
    for (let i = 0; i < CHUNK; i++) {
      const value = arr.shift();
      if (value) {
        promises.push(checkDomain(browserPool, value));
      }
    }
    checks += CHUNK;
    await Promise.all(promises);
    const now = Date.now();
    const chunkTime = (now - lastTime) / 1000;
    if (chunkTime > 1) {
      console.log(
        `Chunk time ${chunkTime} seconds | ${(chunkTime / CHUNK).toFixed(
          2
        )} seconds per domain check | ${(
          (checks / inititalLength) *
          100
        ).toFixed(2)}%`
      );
    }
    lastTime = now;
    if (arr.length > 0) {
      await loop();
    }
  }
  await loop();
}
async function checkDomain(browserPool: BrowserPool, value: string) {
  const page = await browserPool.getPage();
  await page.goto(`https://app.ens.domains/search/${value}`, {
    waitUntil: ["domcontentloaded", "networkidle0"],
  });
  try {
    await page.waitForXPath(
      '//div[contains(text(), "singleName.domain.state")]',
      { timeout: 20000 }
    );
  } catch (e) {
    console.log(`Failure - ${value}`);
    return;
  }

  const isAvailable = await page.evaluate(() => {
    return document.body.innerHTML.includes(
      "singleName.domain.state.available"
    );
  });

  if (isAvailable) {
    fs.appendFileSync(FREEDOMAINFILE, `\n${value}`);
  } else {
    fs.appendFileSync(TAKENFILE, `\n${value}`);
  }
  await page.close();
}
