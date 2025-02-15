const util = require("./utils");

const queryFamilyLink = (
  page
) => `[[-Has subobject::${page}]][[Kategorie:FamilyLink]]
|mainlabel=-
|?KinshipType
|?Person
|?Person.BirthName
|?Person.FamilyName
|?Person.GivenName
|?Person.BirthDate
|?Person.DeathDate
|?Person.PortraitPhotoUrl
|?Person.PhotoCropTag`;

async function extractFamilyLinkData(json, output) {
  const wikiname = output.find((d) => d.wikiname).wikiname;
  util.saveJson("temp/" + wikiname + "_Family", json);
  const list = [];

  for (const [key, jsonSnippet] of Object.entries(json.query.results)) {
    //  console.log(jsonSnippet.printouts);

    const item = {};
    util.extractText("KinshipType", "role", jsonSnippet, item);
    util.extractPersonName("name", jsonSnippet, item);
    util.extractDate("BirthDate", "birthDate", jsonSnippet, item);
    util.extractDate("DeathDate", "deathDate", jsonSnippet, item);
    util.extractText("PhotoCropTag", "PhotoCropTag-orig", jsonSnippet, item);
    await util.extractPhotoWithTag("PortraitPhotoUrl", "", jsonSnippet, item);

    list.push(item);
    // console.log(item);
  }

  output.push({ type: "Familymembers", persons: list });
}

module.exports = {
  queryFamilyLink,
  extractFamilyLinkData,
};
