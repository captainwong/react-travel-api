const fs = require('fs');
const productCollections = require('../data/productCollections.json');
const touristRoutes = require('../data/touristRoutes.json');
const touristRouteDetails = require('../data/touristRouteDetails.json');
const parse = require('node-html-parser').parse;

const takeUrlsFromJson = () => {
  let urls = [];
  productCollections.map((i) => {
    i.touristRoutes.map((j) => {
      j.touristRoutePictures.map((k) => {
        urls.push(k.url);
      })
    })
  })

  touristRoutes.map((i) => {
    i.touristRoutePictures.map((j) => {
      urls.push(j.url);
    })
  })

  touristRouteDetails.map((i) => {
    i.touristRoutePictures.map((j) => {
      urls.push(j.url);
    })

    const root = parse(i.features);
    root.querySelectorAll('img').forEach((img) => {
      urls.push(img.getAttribute('src'));
    })
  })

  console.log('urls.length=', urls.length);
  let uniqueUrls = [];
  urls.forEach((i) => {
    if (i.startsWith('//')) { // imgs in features has no protocol
      i = 'http:' + i;
    }
    if (i.endsWith('.jp')) { // some urls are *.jp, fix them
      i += 'g';
    }
    if (uniqueUrls.indexOf(i) === -1) {
      uniqueUrls.push(i);
    }
  })
  console.log('uniqueUrls.length=', uniqueUrls.length);
  return uniqueUrls;
}

const download = (url, path) => {
  return fetch(url)
    .then((res) => {
      return res.arrayBuffer();
    })
    .then((buf) => {
      fs.writeFile(path, Buffer.from(buf, 'binary'), (err) => {
        if (err) throw err;
        console.log(url, path);
      })
    }).catch(e => {
      console.log('error downloading ' + url, e);
    });
}

async function fetchImgs() {
  let uniqueUrls = takeUrlsFromJson();
  //uniqueUrls = uniqueUrls.slice(0, 2);
  let imgMap = {};
  let imgId = 0;
  let ds = [];
  uniqueUrls.forEach((url) => {
    const path = `./images/${imgId}.jpg`;
    imgMap[url] = imgId++;
    ds.push(download(url, path));
  });

  await Promise.all(ds)
    .then(() => {
      fs.writeFileSync('./images/imgmap.json', JSON.stringify(imgMap, null, '  '));
    })
    .catch(e => {
      console.log(e);
    });
}

fetchImgs();
