const util = require("./utils");

const queryEventRoles = (
  page
) => `[[-Has subobject::${page}]][[Kategorie:EventRole]]
|mainlabel=-
|?EventRole
|?Description
|?Event
|?Event.StartDate
|?Event.EndDate
|?Event.Location
|?Event.Location.GeoCoords
|?Event.PhotoUrl
|?Event.PhotoCropTag
|?Event.VideoUrl
|?Event.VideoTimestamps
|?Event.VideoCaption
|?Reference
|?Medium`;

async function extractEventRoleData(json, output) {
  const wikiname = output.find((d) => d.wikiname).wikiname;
  util.saveJson("temp/" + wikiname + "_EventRole", json);
  const list = [];

  // loop for each life event
  for (const [key, jsonSnippet] of Object.entries(json.query.results)) {
    // console.log(jsonSnippet.printouts);

    const item = {};
    util.extractText("EventRole", "EventRole", jsonSnippet, item);
    util.extractText("Description", "description", jsonSnippet, item);
    util.extractWikiEntity("Event", "event", jsonSnippet, item);
    util.extractGeoCoords(jsonSnippet, item);
    util.extractDate("StartDate", "startDate", jsonSnippet, item);
    util.extractDate("EndDate", "endDate", jsonSnippet, item);
    util.extractText("Reference", "reference", jsonSnippet, item);

    // console.log("key:" + key);
    await util.extractPhotoWithTag("PhotoUrl", "", jsonSnippet, item);
    util.extractText("PhotoCropTag", "PhotoCropTag-orig", jsonSnippet, item);
    await util.extractMedia("VideoUrl", "", jsonSnippet, item);
    await util.extractMedium("PhotoUrl","Medium", jsonSnippet, item);
    util.extractText("VideoTimestamps", "VideoTimestamps", jsonSnippet, item);
    util.extractText("VideoCaption", "LowerThird", jsonSnippet, item);

    list.push(item);
    // console.log(item);
  }

  list.sort(util.startDateComparator);
  output.push({ type: "PublicEvents", events: list });
}

module.exports = {
  queryEventRoles,
  extractEventRoleData,
};