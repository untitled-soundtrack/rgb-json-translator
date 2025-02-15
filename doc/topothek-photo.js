// Export tagged images from Topothek as image downloads plus cropmask

// 0. Example data

// const url = "https://gross-enzersdorf.topothek.at/?doc=1216647";
// const tag = "Johanna Schindler";

const url = "https://gross-enzersdorf.topothek.at/?doc=796416";
const tag = "Stern Oberhausen";

console.log("Starting ...");

// 1. rendered in the browser

// <div id="galleryDocument" style="background: rgb(0, 0, 0); width: 441px; height: 302px; opacity: 1; margin: 326.5px 50px;" class="">
// <img src="data/Gross-Enzersdorf442/files4866/file1216647.jpg?1670353468" title="" alt="Familenstambaum der Johanna Schindler" style="width: 100%; height: 100%; transform: scale(1);">
// <div class="tagBox" data-text="geb 1840, Johanna Schindler" json_tag="23" style="top: 42.5171px; left: 224.18px; width: 51.7769px; height: 70.7381px; opacity: 0; z-index: 10;"></div>

// left: 224,18 / 441 * 1280 = 651
// width: 51,7769 / 441 * 1280 = 150
// top: 42,5171 / 302 * 878 = 124
// height: 70,7381 / 302 * 878 = 206


// BUT: these elements are not in the HTML originally fetched from the server.
// Topothek is using AJAX to dynamically fetch and render the photo.

import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import fs from "fs";

async function getPhotoDataFromHTML() {
  try {
    // Fetch data from URL and store the response into a const
    const response = await fetch(url);
    // Convert the response into text
    const body = await response.text();

    // Load body data
    const $ = cheerio.load(body);

    // console.log(body);
    fs.writeFileSync("photo.html", body);

    const style = $('#galleryDocument').attr('style');
    console.log(style);
    // undefined

    const imgSrc = $('#galleryDocument img').attr('src');
    console.log(imgSrc);
    // undefined
    const cropBox = $('#galleryDocument .tagBox [data-text=' + tag + ']').attr('style');
    console.log(cropBox);
    // undefined
  } catch (error) {
    console.log(error);
  }
}

// getPhotoDataFromHTML();


// 2. analyze AJAX protocol
// https://gross-enzersdorf.topothek.at/includes/ajax.php?action=document&did=1216647&vp=false
// results in a JSON with
// highsrc:	"data/Gross-Enzersdorf442/files4866/high_file1216647.jpg?1670353468"
// and `tags` as array of
// {
//   "w": "11.7408",      // 11,7408 / 100 * 1280 = 150,3
//   "h": "23.4232",      // 23,4232 / 100 * 878 = 205,7
//   "l": "50.8344",      // 50,8344 / 100 * 1280 = 650,7
//   "t": "14.0785",      // 14,0785 / 100 * 878 = 123,6
//   "text": "geb 1840, Johanna Schindler",
//   "level": "2"
// }

function checkAndResolveFromTopothek(inputUrl) {
  const match = inputUrl.match(/^(.*)\.topothek\.at\/\?doc=(\d+)$/);
  if (match) {
    ajaxUrl = match[1] + ".topothek.at/includes/ajax.php?action=document&vp=false&did=" + match[2]
    return ajaxUrl;
  } else {
    return inputUrl;
  }
}

import {downloadFile, fetchOptions} from "./utils.js";

if (url.startsWith("https://gross-enzersdorf.topothek.at/?doc=")) {
  try {
    const ajax = url.replace("?doc=", "includes/ajax.php?action=document&vp=false&did=");
    const response = await fetch(ajax, fetchOptions);
    // Convert the response into text
    const meta = await response.json();

    const imgUrl = "https://gross-enzersdorf.topothek.at/" + meta.src;
    const filename = "b.jpg"
    downloadFile(imgUrl, filename);

    // console.log(meta.tags);
    const tagInfo = meta.tags.find(d => d.text.includes(tag));
    console.log(tagInfo);

  } catch (error) {
    console.warn(error);
  }
} else {
  console.warn("not a GE Topothek photo: " + url);
}

// Policy: https://gross-enzersdorf.topothek.at/robots.txt
// # robots.txt for http://*.topothek.at/

// # global
// User-agent: *

// Disallow: /data
// Disallow: /orig
// Disallow: /tools

// Disallow: /documents.php
// Disallow: /login.php
// Disallow: /*2.php

// Allow: /data/*/files*/file*.jpg$
// Allow: /data/*/files*/file*.pdf$
// Allow: /data/*/files*/file*.mp4$
// Allow: /data/*/files*/file*.mp3$
// Allow: /data/*/files*/file*.webm$
// Allow: /data/*/files*/file*.ogv$


// Allow: /data/*/files*/file*.jpg?
// Allow: /data/*/files*/file*.pdf?
// Allow: /data/*/files*/file*.mp4?
// Allow: /data/*/files*/file*.mp3?
// Allow: /data/*/files*/file*.webm?
// Allow: /data/*/files*/file*.ogv?
