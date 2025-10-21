import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { satisfies } from "semver";

const __dirname = import.meta.dirname;

try {
  const minimumNodeVersion = await readFile(
    join(__dirname, "../../", ".nvmrc"),
    "utf-8",
  );

  const isValidNodeVersion = satisfies(
    process.version,
    `>= ${minimumNodeVersion}`,
  );

  // successfully exit when Node version is valid
  if (isValidNodeVersion) {
    process.exitCode = 0;
  } else {
    const output = `
      ** Invalid Node.js Version **
      current version: ${process.version}
      minimum required version: ${minimumNodeVersion}
      `;

    console.error(output);
    process.exitCode = 1;
  }
} catch (error) {
  console.error("Error checking Node.js version:", error);
  process.exitCode = 1;
}
