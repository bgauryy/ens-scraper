import fs from "fs";
import path from "path";
import {
  AVAILABLE_FILE_NAME,
  UNAVAILABLE_FILE_NAME,
  PREMIUM_FILE_NAME,
} from "../constants";

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
