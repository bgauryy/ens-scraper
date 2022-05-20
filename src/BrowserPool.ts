import { Browser, HTTPRequest } from "puppeteer";
import puppeteer, { VanillaPuppeteer } from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

const DEFAULT_BROWSER_CONF: Parameters<VanillaPuppeteer["launch"]>[0] = {
  headless: true,
  args: ["--incognito"],
};

export default class BrowserPool {
  private conf: Parameters<VanillaPuppeteer["launch"]>[0];
  private poolSize: number;
  private pageLimit: number;
  private browsers: Browser[] = [];
  private index = 0;
  private chunk = 0;

  constructor(
    poolSize: number,
    pageLimit: number,
    conf = DEFAULT_BROWSER_CONF
  ) {
    this.conf = conf;
    this.poolSize = poolSize;
    this.pageLimit = pageLimit;
    this.chunk = this.poolSize * this.pageLimit;
  }

  async getPage() {
    const browserIndex = this.index++ % this.poolSize;
    if (!this.browsers[browserIndex]) {
      this.browsers[browserIndex] = await puppeteer.launch(this.conf);
    }
    return await this.createPage(this.browsers[browserIndex]);
  }

  getChunk() {
    return this.chunk;
  }

  private async createPage(browser: Browser) {
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);
    // TODO - move to page configuration in condtructor (blockResources: true)
    await page.setRequestInterception(true);
    page.on("request", this.onRequest);
    return page;
  }

  private onRequest(req: HTTPRequest) {
    // Block redundant resources
    if (
      req.resourceType() === "image" ||
      req.resourceType() === "stylesheet" ||
      req.resourceType() === "font" ||
      req.url().includes("google") ||
      req.url().includes("sentry") ||
      req.url().includes("locales") ||
      req.url().includes("manifest.json") ||
      req.url().includes("fonts.gstatic")
    ) {
      req.abort();
    } else {
      req.continue();
    }
  }
}
