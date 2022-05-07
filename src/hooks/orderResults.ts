import fs from "fs";
import path from "path";
import { FREEDOMAINFILE, TAKENFILE } from "../constants";

const takenDomainsPath = path.resolve(__dirname, "../../", TAKENFILE);
const availableDomainsPath = path.resolve(__dirname, "../../", FREEDOMAINFILE);
const takenDomains = fs.readFileSync(takenDomainsPath, {
  encoding: "utf-8",
});
const availableDomains = fs.readFileSync(availableDomainsPath, {
  encoding: "utf-8",
});

fs.writeFileSync(
  takenDomainsPath,
  takenDomains
    .split("\n")
    .map((v) => parseInt(v))
    .filter((v) => v)
    .sort()
    .join("\n")
);
fs.writeFileSync(
  availableDomainsPath,
  availableDomains
    .split("\n")
    .map((v) => parseInt(v))
    .filter((v) => v)
    .sort()
    .join("\n")
);
