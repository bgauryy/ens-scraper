import fs from "fs";
import path from "path";

const SET = "abcdefghijklmnopqrstuvwxyz".split("");

export function getAllPermutaions(k) {
  const arr = [];
  printAllKLengthRec(SET, "", SET.length, k, arr);
  return arr;
}

function printAllKLengthRec(set, prefix, n, k, arr) {
  if (k == 0) {
    arr.push(prefix);
    return;
  }
  for (let i = 0; i < n; ++i) {
    const newPrefix = prefix + set[i];
    printAllKLengthRec(set, newPrefix, n, k - 1, arr);
  }
}

export function getResultsList(filePath: string, isInteger = true) {
  const arr = fs
    .readFileSync(path.resolve(__dirname, "../", "results", filePath), {
      encoding: "utf-8",
    })
    .split("\n")
    .filter((val) => val);

  return isInteger ? arr.map((val) => parseInt(val)) : arr;
}

export function updateResults(filePath: string, domain: string) {
  fs.appendFileSync(
    path.resolve(__dirname, "../", "results", filePath),
    `${domain}`
  );
}
