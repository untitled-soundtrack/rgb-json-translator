#!/usr/bin/env node

const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");
const { doAllPersons, doPerson } = require("./person");
const { doAllNarratives } = require("./narrative");

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


