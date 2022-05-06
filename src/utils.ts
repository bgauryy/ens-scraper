const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

export function getLettersCombinations(length: number, charsArray = alphabet) {
  const makeWords = (wordLength) => {
    if (wordLength < 1) {
      return [];
    }

    let counter = 1;
    let words = [...charsArray];

    const addLetter = (word) => charsArray.map((letter) => word + letter);
    const flatten = (sum, curr) => sum.concat(curr);

    while (counter !== wordLength) {
      words = words.map(addLetter).reduce(flatten, []);

      counter++;
    }

    return words;
  };

  return makeWords(length);
}

export function shuffle(array: unknown[]) {
  let currentIndex = array.length,
    randomIndex;

  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}
