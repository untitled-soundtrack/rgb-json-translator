const util = require("./utils");

const queryNarrBase = (page) => `[[${page}]]
|?Description
|?PhotoUrl
|?PhotoCropTag
`;

async function extractBaseData(json, output) {
  for (const [key, jsonSnippet] of Object.entries(json.query.results)) {
    // console.log(jsonSnippet.printouts);

    const item = { type: "NarrativeBase" };
    item.title = key;
    await util.extractPhotoWithTag("PhotoUrl", "", jsonSnippet, item);
    util.extractText("Description", "description", jsonSnippet, item);
    output.push(item);

    break; // only extract 1st entry
  }

  const wikiname = output.find((d) => d.wikiname).wikiname;
  util.saveJson("temp/" + wikiname + "_Base", json);
}

const queryEventsOfNarrative = (
  page
) => `[[PartOf::${page}]][[Kategorie:Ereignis]]
|mainlabel=-
|?Name
|?Description
|?StartDate
|?EndDate
|?Location
|?Location.GeoCoords
|?PhotoUrl
|?PhotoCropTag
|?VideoUrl
|?VideoTimestamps
|?VideoCaption
|?Reference`;

async function extractEventsOfNarrative(json, output) {
  const wikiname = output.find((d) => d.wikiname).wikiname;
  util.saveJson("temp/" + wikiname + "_EventsOfNarrative", json);
  const list = [];

  // loop for each life event
  for (const [key, jsonSnippet] of Object.entries(json.query.results)) {
    // console.log(jsonSnippet.printouts);

    const item = {};
    util.extractText("Name", "name", jsonSnippet, item);
    util.extractPlace("Location", "location", jsonSnippet, item);
    util.extractGeoCoords(jsonSnippet, item);
    util.extractText("Description", "description", jsonSnippet, item);
    util.extractDate("StartDate", "startDate", jsonSnippet, item);
    util.extractDate("EndDate", "endDate", jsonSnippet, item);
    util.extractText("Reference", "reference", jsonSnippet, item);

    // console.log("key:" + key);
    await util.extractPhotoWithTag("PhotoUrl", "", jsonSnippet, item);
    util.extractText("PhotoCropTag", "PhotoCropTag-orig", jsonSnippet, item);
    await util.extractMedia("VideoUrl", "", jsonSnippet, item);
    util.extractText("VideoTimestamps", "VideoTimestamps", jsonSnippet, item);
    util.extractText("VideoCaption", "LowerThird", jsonSnippet, item);

    list.push(item);
    // console.log(item);
  }

  list.sort(util.startDateComparator);
  output.push({ type: "Events", events: list });
}

const queryPersonsOfNarrative = (
  page
) => `[[Has subobject::<q>[[Kategorie:EventRole]][[Event.PartOf:::${page}]]</q>]]
|?Has subobject.EventRole=EventRole
|?FamilyName
|?GivenName
|?BirthName
|?BirthDate
|?PortraitPhotoUrl
|?PhotoCropTag
|?DeathDate`;

async function extractPersonsOfNarrative(json, output) {
  const wikiname = output.find((d) => d.wikiname).wikiname;
  util.saveJson("temp/" + wikiname + "_PersonsOfNarrative", json);
  const list = [];

  // loop for each life event
  for (const [key, jsonSnippet] of Object.entries(json.query.results)) {
    // console.log(jsonSnippet.printouts);

    const item = {};
    util.extractText("EventRole", "EventRole", jsonSnippet, item);
    util.extractPersonName("name", jsonSnippet, item);
    await util.extractPhotoWithTag("PortraitPhotoUrl", "", jsonSnippet, item);
    util.extractText("PhotoCropTag", "PhotoCropTag-orig", jsonSnippet, item);
    util.extractDate("BirthDate", "BirthDate", jsonSnippet, item);
    util.extractDate("DeathDate", "DeathDate", jsonSnippet, item);

    list.push(item);
    // console.log(item);
  }

  list.sort(util.startDateComparator);
  output.push({ type: "Persons", persons: list });
}

async function doAllNarratives() {
  const categoryUrl = "https://regiobiograph.media.fhstp.ac.at/wiki/Kategorie:Narrativ";

  const tasks = [
    { query: queryNarrBase, extractor: extractBaseData },
    { query: queryEventsOfNarrative, extractor: extractEventsOfNarrative },
    { query: queryPersonsOfNarrative, extractor: extractPersonsOfNarrative },
  ];

  const outputDir = "Narrativ/";

  util.doAllByCategory(categoryUrl, tasks, outputDir);
}

module.exports = {
  doAllNarratives,
  queryNarrBase,
  extractBaseData,
  queryEventsOfNarrative,
  extractEventsOfNarrative,
  queryPersonsOfNarrative,
  extractPersonsOfNarrative,
};
