const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');

const CHUNK = 50;
const TAKENFILE = 'nums-taken.txt';
const FREEDOMAINFILE = 'nums-available.txt';

process.setMaxListeners(0);
puppeteer.use(StealthPlugin());

const takenDomains = fs.readFileSync(TAKENFILE, {encoding: "utf-8"});
const availableDOmains = fs.readFileSync(FREEDOMAINFILE, {encoding: "utf-8"});

const arr = [];
for (let i =27000; i < 40000; i++ ){
  arr.push(i);
}

run(arr);
console.log('Done');
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
  console.log('Done');
}

async function checkDomain(check) {
  if (!check || takenDomains.includes(check) || availableDOmains.includes(check)) {
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
    const isPremium = await page.evaluate(() => {
      return document.querySelector('#root').innerHTML.toLowerCase().includes('premium')
    });
    //await page.screenshot({ path: `${check}.png`, fullPage: true });
    if (!isExpired && !isUnavailable) {
      console.log('available!!!', check);
      fs.appendFileSync(FREEDOMAINFILE, `${check}${isPremium ? ' - PREMIUM' : ''}\n`);
    } else {
      fs.appendFileSync(TAKENFILE, `${check}${isPremium ? ' - PREMIUM' : ''}\n`);
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

  return makeWords(4);
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
