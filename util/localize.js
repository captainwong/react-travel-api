const imgMap = require('../images/imgmap.json');
const fs = require('fs');
const path = require("path");
const parse = require('node-html-parser').parse;
const config = require('../config');

let imgCache = {};

function img2Local(url) {
  if (imgCache.hasOwnProperty(url)) {
    return imgCache[url];
  }
  if (imgMap.hasOwnProperty(url)) {
    const jpg = path.resolve(__dirname, `../images/${imgMap[url]}.jpg`);
    if (fs.existsSync(jpg)) {
      url = `${config.url}/${imgMap[url]}.jpg`;
      return url;
    }
  }
  return url;
}

function convertImg2Local(json) {
  if (Array.isArray(json)) {
    json.map((i) => {
      if (i.touristRoutes) {
        i.touristRoutes.map((j) => {
          j.touristRoutePictures.map((k) => {
            k.url = img2Local(k.url);
          })
        })
      } else if (i.touristRoutePictures) {
        i.touristRoutePictures.map((k) => {
          k.url = img2Local(k.url);
        })
      }
    })
  } else if (json.touristRoutePictures) {
    json.touristRoutePictures.map((k) => {
      k.url = img2Local(k.url);
    })
  }
  return json;
}

function convertDetailFeature2Local(json) {
  const root = parse(json.features);
  root.querySelectorAll('img').forEach((img) => {
    img.removeAttribute('data-src');
    let url = img.getAttribute('src');
    if (url.startsWith('//')) {
      url = 'http:' + url;
    }
    const src = img2Local(url);
    img.setAttribute('src', src);
    console.log(img.parentNode.toString());
  })
  json.features = root.toString();
  return json;
}

module.exports = {
  convertImg2Local,
  convertDetailFeature2Local,
}