import * as util from "./utils.js";
import { queryLifeEvent, extractLifeEventData } from "./life-events.js";
import { queryFamilyLink, extractFamilyLinkData } from "./family-links.js";
import { queryResidence, extractResidenceData } from "./residences.js";
import { queryOccupation, extractOccupationData } from "./occupations.js";
import { queryEventRoles, extractEventRoleData } from "./persons-events.js";

const queryBase = (page) => `[[${page}]]
|?FamilyName
|?GivenName
|?BirthName
|?BirthDate
|?BirthPlace
|?PortraitPhotoUrl
|?PhotoCropTag
|?CurrentState
|?CurrentDetails
|?CurrentReference
|?CurrentStateDate
|?GraveDetails
|?GraveYard
|?GraveYard.ContainedInPlace=GYLoc
|?GravePhotoUrl
|?DeathDate
|?DeathPlace`;

// |?BirthPlace.GeoCoords=BGeoCoords
// |?DeathPlace.GeoCoords=DGeoCoords
// |?GraveYard.Location.GeoCoords=GGeoCoords

async function extractBaseData(json, output) {
  for (const [key, jsonSnippet] of Object.entries(json.query.results)) {
    // console.log(jsonSnippet.printouts);

    const name = { type: "Name" };
    util.extractPersonName("name", jsonSnippet, name);
    await util.extractPhotoWithTag("PortraitPhotoUrl", "", jsonSnippet, name);
    util.extractText("PhotoCropTag", "PhotoCropTag-orig", jsonSnippet, name);
    output.push(name);

    const birth = { type: "BirthDate" };
    util.extractDate("BirthDate", "date", jsonSnippet, birth);
    util.extractPlace("BirthPlace", "place", jsonSnippet, birth);
    output.push(birth);

    const death = { type: "DateOfDeath" };
    util.extractDate("DeathDate", "date", jsonSnippet, death);
    util.extractPlace("DeathPlace", "place", jsonSnippet, death);
    output.push(death);

    /** Florian Bauer: Additional biographical data regarding the current state of the person */
    const currentstate = { type: "CurrentState" };
    util.extractText("CurrentState", "CurrentState", jsonSnippet, currentstate);
    util.extractText("CurrentDetails", "CurrentDetails", jsonSnippet, currentstate);
    util.extractText("CurrentReference", "CurrentReference", jsonSnippet, currentstate);
    util.extractDate("CurrentStateDate", "CurrentStateDate", jsonSnippet, currentstate);
    output.push(currentstate);
    
    // TODO separate section for graveyard?
    const grave = { type: "Grave" };
    util.extractWikiEntity("GraveYard", "GraveYard", jsonSnippet, grave);
    util.extractPlace("GYLoc", "place", jsonSnippet, grave);
    util.extractText("GraveDetails", "GraveDetails", jsonSnippet, grave);
    util.extractMedia("GravePhotoUrl", "", jsonSnippet, grave);
    output.push(grave);


    break; // only extract 1st entry
  }

  const wikiname = output.find((d) => d.wikiname).wikiname;
  util.saveJson("temp/" + wikiname + "_Base", json);
}

const categoryUrl = "https://regiobiograph.media.fhstp.ac.at/wiki/Kategorie:Person";

const tasks = [
  { query: queryBase, extractor: extractBaseData },
  { query: queryLifeEvent, extractor: extractLifeEventData },
  { query: queryEventRoles, extractor: extractEventRoleData },
  { query: queryFamilyLink, extractor: extractFamilyLinkData },
  { query: queryResidence, extractor: extractResidenceData },
  { query: queryOccupation, extractor: extractOccupationData },
];

const outputDir = "Person/";

export async function doAllPersons() {
  util.doAllByCategory(categoryUrl, tasks, outputDir);
}

export async function doPerson(url) {
  util.doEntity(url, tasks, outputDir, true);
}
