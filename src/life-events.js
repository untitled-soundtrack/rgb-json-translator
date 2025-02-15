const util = require("./utils");
const queryLifeEvent = (
  page
) => `[[-Has subobject::${page}]][[Kategorie:LifeEvent]]
|mainlabel=-
|?LifeEventType
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

async function extractLifeEventData(json, output) {
  const wikiname = output.find((d) => d.wikiname).wikiname;
  util.saveJson("temp/" + wikiname + "_LifeEvent", json);
  const list = [];

  // loop for each life event
  for (const [key, jsonSnippet] of Object.entries(json.query.results)) {
    console.log(jsonSnippet.printouts);

    const item = {};
    util.extractText("LifeEventType", "name", jsonSnippet, item);
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
    await util.extractMedium("Medium","", jsonSnippet, item);
    util.extractText("VideoTimestamps", "VideoTimestamps", jsonSnippet, item);
    util.extractText("VideoCaption", "LowerThird", jsonSnippet, item);

    list.push(item);
    console.log(item);
  }

  list.sort(util.startDateComparator);
  // console.log(list);
  output.push({ type: "PersonalEvents", events: list });
}

module.exports = {
  queryLifeEvent,
  extractLifeEventData,
};
