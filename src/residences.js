const util = require("./utils");

const queryResidence = (
  page
) => `[[-Has subobject::${page}]][[Kategorie:Residence]]
|mainlabel=-
|?homeLocation
|?homeLocation.GeoCoords
|?Description
|?StartDate
|?EndDate
|?Reference`;

async function extractResidenceData(json, output) {
  const wikiname = output.find((d) => d.wikiname).wikiname;
  util.saveJson("temp/" + wikiname + "_Residence", json);
  const list = [];

  for (const [key, jsonSnippet] of Object.entries(json.query.results)) {
    //  console.log(jsonSnippet.printouts);

    const item = {};
    util.extractPlace("HomeLocation", "name", jsonSnippet, item);
    util.extractGeoCoords(jsonSnippet, item);
    util.extractText("Description", "description", jsonSnippet, item);
    util.extractDate("StartDate", "startDate", jsonSnippet, item);
    util.extractDate("EndDate", "endDate", jsonSnippet, item);

    list.push(item);
    // console.log(item);
  }

  list.sort(util.startDateComparator);
  output.push({ type: "Residences", residences: list });
}

module.exports = {
  queryResidence,
  extractResidenceData,
};