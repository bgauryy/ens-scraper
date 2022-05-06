import { Browser } from "puppeteer";
import puppeteer, { VanillaPuppeteer } from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

const DEFAULT_BROWSER_CONF: Parameters<VanillaPuppeteer["launch"]>[0] = {
  headless: true,
  args: ["--incognito"],
};

export default class BrowserPool {
  private conf: Parameters<VanillaPuppeteer["launch"]>[0] = {
    headless: true,
    args: ["--incognito"],
  };
  private timeout = 250;
  private poolSize;
  private browsers: Browser[] = [];
  private index = 0;

  constructor(poolSize: number, conf = DEFAULT_BROWSER_CONF) {
    this.conf = conf;
    this.poolSize = poolSize || 5;
  }

  async getPage() {
    const browserIndex = this.index++ % this.poolSize;
    if (!this.browsers[browserIndex]) {
      this.browsers[browserIndex] = await puppeteer.launch(this.conf);
    }
    return await this._createPage(this.browsers[browserIndex]);
  }

  private async _createPage(browser: Browser) {
    const page = await browser.newPage();
    // TODO - set by configuration
    await page.setRequestInterception(true);
    page.setDefaultNavigationTimeout(0);
    page.on("request", this.onRequest);
    return page;
  }

  //TODO - fix type
  private onRequest(req: any) {
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
