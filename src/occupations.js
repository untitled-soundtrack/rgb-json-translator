const util = require("./utils");
const queryOccupation = (
  page
) => `[[-Has subobject::${page}]][[Kategorie:OccupationalRole]]
|mainlabel=-
|?HasOccupation
|?Description
|?StartDate
|?EndDate
|?Reference`;

async function extractOccupationData(json, output) {
  const wikiname = output.find((d) => d.wikiname).wikiname;
  util.saveJson("temp/" + wikiname + "_Occupation", json);
  const list = [];

  for (const [key, jsonSnippet] of Object.entries(json.query.results)) {
    // console.log(jsonSnippet.printouts);

    const item = {};
    util.extractWikiEntity("HasOccupation", "name", jsonSnippet, item);
    util.extractText("Description", "description", jsonSnippet, item);
    util.extractDate("StartDate", "startDate", jsonSnippet, item);
    util.extractDate("EndDate", "endDate", jsonSnippet, item);

    list.push(item);
    // console.log(item);
  }

  list.sort(util.startDateComparator);
  output.push({ type: "Jobs", jobs: list });
}

module.exports = {
  queryOccupation,
  extractOccupationData,
};