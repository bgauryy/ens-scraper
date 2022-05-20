import { run } from "../dist/index";
import { DOMAIN_STATUS } from "../dist/src/runner";
import { updateResults, getResultsList, getAllPermutaions } from "../src/util";

export const AVAILABLE_FILE_NAME = "n-available.txt";
export const PREMIUM_FILE_NAME = "n-premium.txt";
export const UNAVAILABLE_FILE_NAME = "n-unavailable.txt";
export const AVAILABLE_4W_FILE_NAME = "w4-available.txt";
export const PREMIUM_4W_FILE_NAME = "w4-premium.txt";

scan4wDomains();

export function scan4wDomains() {
  const ethDomainsToCheck: string[] = [];
  const domainsToCheck = getAllPermutaions(4);
  const takenDomains: string[] = getResultsList(
    AVAILABLE_4W_FILE_NAME,
    false
  ) as string[];

  for (const value of domainsToCheck) {
    if (!takenDomains.includes(value)) {
      ethDomainsToCheck.push(value);
    }
  }

  run(ethDomainsToCheck, (domain: string, status: DOMAIN_STATUS) => {
    if (status === DOMAIN_STATUS.AVAILABLE) {
      updateResults(AVAILABLE_4W_FILE_NAME, `\n${domain}`);
    }
  });
}

export function scanNumericDomains() {
  const ethDomainsToCheck: string[] = [];
  const takenDomains = getResultsList(UNAVAILABLE_FILE_NAME) as number[];
  const availableDomains = getResultsList(AVAILABLE_FILE_NAME) as number[];
  const premiumDomains = getResultsList(PREMIUM_FILE_NAME) as number[];

  for (let i = 100; i < 200000; i++) {
    const value = i;
    if (
      !premiumDomains.includes(value) &&
      !takenDomains.includes(value) &&
      !availableDomains.includes(value)
    ) {
      ethDomainsToCheck.push(String(value));
    }
  }

  run(ethDomainsToCheck, (domain: string, status: DOMAIN_STATUS) => {
    if (status === DOMAIN_STATUS.PREMIUM) {
      updateResults(PREMIUM_FILE_NAME, domain);
    } else if (status === DOMAIN_STATUS.AVAILABLE) {
      updateResults(AVAILABLE_FILE_NAME, `\n${domain}`);
    } else if (status === DOMAIN_STATUS.UNAVAILABLE) {
      updateResults(UNAVAILABLE_FILE_NAME, `\n${domain}`);
    }
  });
}
