import BrowserPool from "./BrowserPool";
import { getDomainStatus } from "./DomainChecker";

export enum DOMAIN_STATUS {
  AVAILABLE,
  UNAVAILABLE,
  PREMIUM,
  FAILURE,
}

export type RUNNER_HANDLER = (domain: string, status: DOMAIN_STATUS) => void;

export type RUNNER_CONF = {
  poolSize: number;
  pageLimit: number;
};

export async function run(
  valuesToCheck: string[],
  handler: RUNNER_HANDLER,
  conf: RUNNER_CONF = {
    poolSize: 5,
    pageLimit: 8,
  }
) {
  const inititalLength = valuesToCheck.length;
  let checks = 0;
  const browserPool = new BrowserPool(conf.poolSize, conf.pageLimit);
  let lastTime = Date.now();

  console.log(`Chunk Size ${browserPool.getChunk()} | Check ${inititalLength}`);

  async function loop() {
    const promises = [];
    for (let i = 0; i < browserPool.getChunk(); i++) {
      const value = valuesToCheck.shift();
      if (value) {
        promises.push(checkDomain(browserPool, value, handler));
      }
    }
    checks += browserPool.getChunk();
    await Promise.all(promises);
    const now = Date.now();
    const chunkTime = (now - lastTime) / 1000;
    if (chunkTime > 1) {
      console.log(
        `Chunk time ${chunkTime} seconds | ${(
          chunkTime / browserPool.getChunk()
        ).toFixed(2)} seconds per domain check | ${(
          (checks / inititalLength) *
          100
        ).toFixed(2)}% (${checks}/${inititalLength})`
      );
    }
    lastTime = now;
    if (valuesToCheck.length > 0) {
      await loop();
    }
  }
  await loop();
}

async function checkDomain(
  browserPool: BrowserPool,
  domain: string,
  handler: RUNNER_HANDLER
) {
  const status = await getDomainStatus(browserPool, domain);
  handler(domain, status);
}
