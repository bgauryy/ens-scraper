import { run } from "./src/runner";

process.setMaxListeners(0);

const arr: string[] = [];
for (let i = 30000; i < 100000; i++) {
  arr.push(`${i}`);
}

//https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

shuffleArray(arr);

run(arr);
