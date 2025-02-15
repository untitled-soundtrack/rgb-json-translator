const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const API_PREFIX = "/api.php?action=ask&query=";
const API_POSTFIX = "&format=json&api_version=2";
const OUT_PATH = "./output5/";

async function extractEntities(json, output) {
  for (const [_, jsonSnippet] of Object.entries(json.query.results)) {
    output.push(jsonSnippet.fullurl);
  }
  return json["query-continue-offset"];
}

async function doAllByCategory(categoryUrl, tasks, outputDir) {
  const { baseUrl, wikiname } = splitUrl(categoryUrl);

  let offset = 0;

  while (offset !== undefined) {
    const qUrl =
      baseUrl +
      API_PREFIX +
      encodeURIComponent(`[[${wikiname}]]|offset=${offset}`) +
      API_POSTFIX;
    // console.log(qUrl);

    const entities = [];
    offset = await slowFetch(qUrl, fetchOptions)
      .then((response) => response.json())
      .then((json) => extractEntities(json, entities));

    console.log("fetched " + offset);

    for (const entity of entities) {
      await doEntity(entity, tasks, outputDir);
    }
  }

}

async function doEntity(url, tasks, outputDir, force = false) {
  const { baseUrl, wikiname } = splitUrl(url);

  if (!force && checkJsonExists(outputDir + wikiname)) {
    console.log("Skip existing: " + wikiname);
    return;
  }

  console.log("Start: " + wikiname);
  const output = [];
  output.push({ wikiname: wikiname });

  for (const task of tasks) {
    const qUrl =
      baseUrl +
      API_PREFIX +
      encodeURIComponent(task.query(decodeURIComponent(wikiname))) +
      API_POSTFIX;
    // console.log(qUrl);

    await slowFetch(qUrl, fetchOptions)
      .then((response) => response.json())
      .then((json) => task.extractor(json, output))
      .then(() => console.log("fetched " + wikiname + " " + output.length));
  }

  // save person json in a separate folder (from narratives and houses)
  saveJson(OUT_PATH + outputDir + wikiname + "/" + wikiname, output);

  console.log("Done: " + wikiname);
}

function splitUrl(url) {
  const parts = url.split("/wiki/", 2);
  return { baseUrl: parts[0], wikiname: parts[1] };
}

// TODO how store missing information? now as "" (or maybe "#")

function extractDate(key, outKey, jsonSnippet, output) {
  if (jsonSnippet.printouts[key].length > 0) {
    const rawDate = jsonSnippet.printouts[key][0].raw;

    const dateParts = rawDate.split("/");
    if (dateParts.length == 4) {
      output[outKey] = dateParts[1] + "-" + dateParts[2] + "-" + dateParts[3];
      output[outKey + "Type"] = "YMD";
    } else if (dateParts.length == 3) {
      output[outKey] = dateParts[1] + "-" + dateParts[2];
      output[outKey + "Type"] = "YM";
    } else if (dateParts.length == 2) {
      output[outKey] = dateParts[1];
      output[outKey + "Type"] = "Y";
    } else {
      output[outKey] = rawDate;
      output[outKey + "Type"] = "ERROR";
    }
  } else {
    output[outKey] = "0";
    output[outKey + "Type"] = "NA";
  }
}

function extractPlace(key, outKey, jsonSnippet, output) {
  if (jsonSnippet.printouts[key].length > 0) {
    output[outKey] = jsonSnippet.printouts[key][0].fulltext;
  } else {
    output[outKey] = "";
  }
}


function extractGeoCoords(jsonSnippet, output) {
  if (jsonSnippet.printouts.GeoCoords.length > 0) {
    // output.GeoCoords = jsonSnippet.printouts.GeoCoords[0];
    output.geoCoordLat = jsonSnippet.printouts.GeoCoords[0].lat;
    output.geoCoordLon = jsonSnippet.printouts.GeoCoords[0].lon;
  }
}

function extractText(key, outKey, jsonSnippet, output) {
  if (jsonSnippet.printouts[key] && jsonSnippet.printouts[key].length > 0) {
    output[outKey] = jsonSnippet.printouts[key][0];
  } else {
    output[outKey] = "";
  }
}

// TODO same as extractPlace
function extractWikiEntity(key, outKey, jsonSnippet, output) {
  if (jsonSnippet.printouts[key] && jsonSnippet.printouts[key].length > 0) {
    if (jsonSnippet.printouts[key][0].fulltext) {
      output[outKey] = jsonSnippet.printouts[key][0].fulltext;
    }
    if (jsonSnippet.printouts[key][0].fullurl) {
      output[outKey+"-url"] = jsonSnippet.printouts[key][0].fullurl;
    }
  } else {
    output[outKey] = "";
  }
}

function extractPersonName(outKey, jsonSnippet, output) {
  // const nameParts = {};
  extractText("FamilyName", "familyName", jsonSnippet, output);
  extractText("GivenName", "givenName", jsonSnippet, output);
  extractText("BirthName", "birthName", jsonSnippet, output);
  let persName = (output.givenName + " " + output.familyName).trim();
  if (persName.length == 0) {
    persName = jsonSnippet.fulltext
      ? jsonSnippet.fulltext
      : (jsonSnippet.printouts.Person.length > 0)
        ? jsonSnippet.printouts.Person[0].fulltext
        : "";
  }
  output[outKey] = persName;

  output["url"] = jsonSnippet.fullurl
    ? jsonSnippet.fullurl
    : (jsonSnippet.printouts.Person.length > 0)
      ? jsonSnippet.printouts.Person[0].fullurl
      : "";

  output["wikiname"] = splitUrl(output["url"]).wikiname;
}

async function extractPhotoWithTag(key, outKey, jsonSnippet, output)  {
  const inputUrl = jsonSnippet.printouts[key][0];
  if (inputUrl) {
    const cropTag = jsonSnippet.printouts["PhotoCropTag"][0];
    const topo = await checkAndResolveFromTopothek(inputUrl, cropTag)
    output[key+"-orig-url"] = topo.mediumUrl;
    const file = convertUrlToFsPath(topo.mediumUrl)
    downloadFile(topo.mediumUrl, file).catch((e) => {
        console.error(e);
        output[key+"-error"] = "error " + e;
        output[key] = "";
    });
    output[key] = file.replaceAll("/", "\\");    

    if (topo.crop) {
      output["PhotoCrop"] = topo.crop;
    }
  }
}

// TODO merge with photo?
async function extractMedia(key, outKey, jsonSnippet, output)  {
  const inputUrl = jsonSnippet.printouts[key][0];
  if (inputUrl) {
    const topo = await checkAndResolveFromTopothek(inputUrl)
    output[key+"-orig-url"] = topo.mediumUrl;
    const file = convertUrlToFsPath(topo.mediumUrl)
    downloadFile(topo.mediumUrl, file).catch((e) => {
      console.error(e);
      output[key+"-error"] = "error " + e;
      output[key] = "";
     });

    output[key] = file.replaceAll("/", "\\");    
  }
}

/** Florian Bauer: Extract medium infos (Document, Photo) from the Topothek item */
async function extractMedium(key, outKey, jsonSnippet, output)  {
  const inputUrl = jsonSnippet.printouts["PhotoUrl"][0]; 
  // console.log("jsonSnippet: " + inputUrl) ;
  // console.log("extractMedium inputUrl: " + inputUrl);
  
  if (inputUrl)
  {
    const topo = await checkAndResolveFromTopothek(inputUrl);
    if (topo.medium) {
      output["Medium"] = topo.medium;   
      console.log("extractMedium: " + topo.medium)
    }   
  }  
}

// Fetch-Optionen definieren; Csrftoken ist aktuell für den Fetch von der Topothek notwendig
const fetchOptions = {
  method: 'GET', // oder 'POST', falls erforderlich
  headers: {
      'Csrftoken': '', // CSRF-Token hinzufügen (muss nur mitgegeben werden, Inhalt ist egal)
      'Content-Type': 'application/json', // Setze den Content-Type, falls benötigt
  },
};

/** if the url is a shared Topothek link, resolves the medium's real url; otherwise keep input url */
async function checkAndResolveFromTopothek(inputUrl, cropTag) {
  const match = inputUrl.match(/^(.*)\.topothek\.at\/(?:index.php)?\?doc=(\d+)$/);
  if (match) {
    const ajaxUrl = match[1] + ".topothek.at/includes/ajax.php?action=document&vp=false&did=" + match[2];
    console.log("resolve topo:  " + ajaxUrl);
    const response = await slowFetch(ajaxUrl, fetchOptions);
    
    const meta = await response.json();
    const mediumUrl = match[1] + ".topothek.at/" + meta.src;    
    const medium = meta.detail.Medium; 
           
    return {mediumUrl, crop: parseCropTags(meta, cropTag), medium};    
  } else {
    const medium="Nicht erfasst";
    return {mediumUrl: inputUrl, crop: null, medium};    
  }
}

function parseCropTags(meta, cropTag) {
  if (cropTag) {
    const info = meta.tags.find(d => d.text.includes(cropTag));
    if (info) {
      return info.w + "," + info.h + "," + info.l + "," + info.t;
    } else {
      return null;
    }
  } else {
    return null;
  }
}

function convertUrlToFsPath(urlStr) {
  // const match = url.match(/^(.*)\/([^/]+)(?:\?|$)/); // better use builtin URL API
  const url = new URL(urlStr);
  // might throw TypeError exception

  return url.hostname + url.pathname;
}


function guessFilename(url) {
  const match = url.match(/\/([^/]+\.\w+)(?:\?|$)/);
  if (match) {
    return match[1];
  } else {
    return null;
  }
}

// from <https://stackoverflow.com/a/51302466/1140589>
// alternative: <https://gist.github.com/crazy4groovy/7afd0ed9fbb2f663e695ff38a32da26f>
async function downloadFile(url, filePath) {

  if (fs.existsSync(OUT_PATH + filePath)) {
    console.log("skip download: " + filePath);
  } else {
    console.log("downloading: " + filePath);
    const res = await slowFetch(url, fetchOptions);
    fs.mkdirSync(path.dirname(OUT_PATH + filePath), {recursive: true});
    const fileStream = fs.createWriteStream(OUT_PATH + filePath);
    await new Promise((resolve, reject) => {
      // console.log("type: ");
        // console.log(res.headers);
        // inferMediaType(url, res.headers);
        res.body.pipe(fileStream);
        res.body.on("error", reject);
        fileStream.on("finish", resolve);
      });
  }
}

// based on <https://blog.thoughtspile.tech/2018/07/07/rate-limit-promises/>
const slowFetch = rateLimit1(fetch, 1000);
function rateLimit1(fn, msPerOp) {
  let wait = Promise.resolve();
  return (...a) => {
    // We use the queue tail in wait to start both the
    // next operation and the next delay
    const res = wait.then(() => fn(...a));
    wait = wait.then(() => resolveAfter(msPerOp));
    return res;
  };
}
const resolveAfter = ms => new Promise(ok => setTimeout(ok, ms));


/*const fetchOptions = {
  headers: {
      "User-Agent": "RegioBiograph Translator <https://research.fhstp.ac.at/en/projects/regiobiograph>",       
    },
}*/

function inferMediaType(url, headers) {
  // if (headers['content-type']) {
    console.log(headers['content-type']);
  // }
}

function startDateComparator(a, b) {
  return a.startDate == b.startDate ? 0 : a.startDate > b.startDate ? 1 : -1;
}

function checkJsonExists(filename) {
  const outPath = OUT_PATH + filename + ".json";
  return fs.existsSync(outPath);
}

function saveJson(filename, output) {
  const outPath = filename + ".json";
  fs.mkdirSync(path.dirname(outPath), {recursive: true});
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
}

module.exports = {
  extractEntities,
  doAllByCategory,
  doEntity,
  splitUrl,
  extractDate,
  extractPlace,
  extractGeoCoords,
  extractText,
  extractWikiEntity,
  extractPersonName,
  downloadFile,
  saveJson,
  startDateComparator,
  extractPhotoWithTag,
  extractMedia,
  extractMedium
};