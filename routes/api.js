const express = require('express');
const router = express.Router();
const imgMap = require('../images/imgmap.json');
const fs = require('fs');
const path = require("path");
const parse = require('node-html-parser').parse;
const sleep = require('../util/sleep');
const paginate = require('../util/paginate');
const cartRouter = require('./cart');
const ordersRouter = require('./order');
const config = require('../config');
const checkIcode = require('../middleware/icode');
const mock = require('../data');

router.use(checkIcode);
router.use('/shoppingCart', cartRouter);
router.use('/orders', ordersRouter);

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

router.get('/productCollections', async function (req, res, next) {
  console.log('sleeping...');
  await sleep(config.sleepms);
  console.log('ok');
  res.json(convertImg2Local(mock.productCollections));
});

router.get('/touristRoutes/:touristRouteId', async function (req, res, next) {
  for (let i = 0; i < mock.touristRouteDetails.length; i++) {
    let route = mock.touristRouteDetails[i];
    if (route.id === req.params.touristRouteId) {
      return res.json(convertDetailFeature2Local(convertImg2Local(route)));
    }
  }
  res.status(422).json(mock.touristRouteNotFound);
})

router.get('/touristRoutes', async function (req, res, next) {
  let routes = mock.touristRoutes;
  if (req.query.keyword) {
    routes = routes.filter((i, n) => {
      return i.title.includes(req.query.keyword);
    })
  }
  if (routes.length == 0) {
    return res.status(404).json("没有旅游路线");
  }
  console.log('routes.length=', routes.length);

  let out = paginate(req, routes);
  res.set('x-pagination', JSON.stringify(out.pagination));
  return res.json(convertImg2Local(out.data));
})


module.exports = router;