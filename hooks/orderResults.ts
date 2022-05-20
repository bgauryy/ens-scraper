import fs from "fs";
import path from "path";

//TODO - make constant
export const AVAILABLE_FILE_NAME = "n-available.txt";
export const PREMIUM_FILE_NAME = "n-premium.txt";
export const UNAVAILABLE_FILE_NAME = "n-unavailable.txt";
export const AVAILABLE_4W_FILE_NAME = "w4-available.txt";
export const PREMIUM_4W_FILE_NAME = "w4-premium.txt";

sortResults(AVAILABLE_FILE_NAME);
sortResults(UNAVAILABLE_FILE_NAME);
sortResults(PREMIUM_FILE_NAME);

function sortResults(fileName: string) {
  const filePath = path.resolve(__dirname, "../../", fileName);
  const fileContent = fs.readFileSync(filePath, {
    encoding: "utf-8",
  });

  fs.writeFileSync(
    filePath,
    fileContent
      .split("\n")
      .map((v) => parseInt(v))
      .filter((v) => v)
      .sort()
      .join("\n")
  );
}
