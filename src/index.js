#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { doAllPersons, doPerson } from "./person.js";
import { doAllNarratives } from "./narrative.js";

const argv = yargs(hideBin(process.argv)).option("url", {
  alias: "u",
  describe: "URL of the person's wiki page",
  type: "string",
  demandOption: false,
  //   })
  //   .option("verbose", {
  //     alias: "v",
  //     type: "boolean",
  //     description: "Run with verbose logging",
}).argv;

// const button = document.getElementById("exportButton");

// button.addEventListener("click", doAllPersons);

console.log("Starting ...");
console.log(argv.url);

if (argv.url) {
  doPerson(argv.url);
} else {
  doAllPersons();
  doAllNarratives();
}


