const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const CHUNK = 15;

process.setMaxListeners(0);
puppeteer.use(StealthPlugin());

run(shuffle(getLettersCombinations()));

async function run(arr) {
  do {
    {
      console.log('checking...');
      const promises = [];
      for (let i = 0.; i < CHUNK; i++) {
        promises.push(checkDomain(arr.shift()));
      }
      await Promise.all(promises);
    }
  } while (arr.length > 0);
}

async function checkDomain(check) {
  if (!check) {
    return;
  }
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(`https://app.ens.domains/search/${check}`, { 'timeout': 20000, 'waitUntil': ['load', 'networkidle0'] });
    await page.waitForSelector(`[data-testid="domain-${check}.eth"]`)
    const isUnavailable = await page.evaluate(() => {
      return document.querySelector('#root').innerHTML.toLowerCase().includes('unavailable')
    });
    const isExpired = await page.evaluate(() => {
      return document.querySelector('#root').innerHTML.toLowerCase().includes('expire')
    });
    //await page.screenshot({ path: `${check}.png`, fullPage: true });
    if (!isExpired && !isUnavailable) {
      console.log('available!!!', check)

      fs.appendFileSync('freeDomains.txt', `${check}\n`);
    }
    await browser.close();
  } catch (e) {
    console.log(`failed ${check}`, e)
  }
}

function getLettersCombinations() {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

  const makeWords = wordLength => {
    if (wordLength < 1) {
      return [];
    }

    let counter = 1;
    let words = [...alphabet];

    const addLetter = word => alphabet.map(letter => word + letter);
    const flatten = (sum, curr) => sum.concat(curr);

    while (counter !== wordLength) {
      words = words.map(addLetter).reduce(flatten, []);

      counter++;
    }

    return words;
  };

  return makeWords(3);
}

function shuffle(array) {
  let currentIndex = array.length, randomIndex;

  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}
