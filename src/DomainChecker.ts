import BrowserPool from "./BrowserPool";
import { DOMAIN_STATUS } from "./runner";

process.setMaxListeners(0);

export async function getDomainStatus(
  browserPool: BrowserPool,
  domain: string
): Promise<DOMAIN_STATUS> {
  try {
    const page = await browserPool.getPage();
    await page.goto(`https://app.ens.domains/search/${domain}`, {
      waitUntil: ["domcontentloaded", "networkidle0"],
    });

    await page.waitForXPath(
      '//div[contains(text(), "singleName.domain.state")]',
      { timeout: 20000 }
    );

    const isAvailable = await page.evaluate(() => {
      return document.body.innerHTML.includes(
        "singleName.domain.state.available"
      );
    });

    const isPremium = await page.evaluate(() => {
      return document.body.innerHTML.includes(
        "singleName.expiry.isUnderPremiumSale"
      );
    });
    //don't wait for promise
    page.close();

    if (isPremium) {
      return DOMAIN_STATUS.PREMIUM;
    } else if (isAvailable) {
      return DOMAIN_STATUS.AVAILABLE;
    } else {
      return DOMAIN_STATUS.UNAVAILABLE;
    }
  } catch (e) {
    return DOMAIN_STATUS.FAILURE;
  }
}
