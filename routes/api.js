var express = require('express');
var router = express.Router();
const productCollections = require('./productCollections');
const touristRoutes = require('./touristRoutes.json');
const touristRouteNotFound = require('./touristRouteNotFound.json');
const touristRouteDetails = require('./touristRouteDetails.json');
const imgMap = require('../images/imgmap.json');
const fs = require('fs');
const path = require("path");
const parse = require('node-html-parser').parse;
const sleep = require('./sleep');
const userdb = require('../userdb');
const cartRouter = require('./cart');
const config = require('../config');

router.use('/shoppingCart', cartRouter);

router.use(async (req, res, next) => {
  const key = req.headers['x-icode'];
  if (!key) {
    console.log(req.headers);
    return res.status(400).json({
      status: 400,
      msg: 'x-icode required',
    });
  }
  const apiKeys = ['foo', 'bar', 'baz', 'D4D928FF7C10128D', 'F5F433A587BDBCC7'];
  if (apiKeys.indexOf(key) === -1) {
    return res.status(400).json({
      status: 400,
      msg: 'invalid x-icode',
    });
  }
  next();
});

let imgCache = {};

function img2Local(url) {
  if (imgCache.hasOwnProperty(url)) {
    return imgCache[url];
  }
  if (imgMap.hasOwnProperty(url)) {
    // const jpg = path.resolve(__dirname, `../images/${imgMap[url]}.jpg`);        
    // const data = fs.readFileSync(jpg);
    // const base64 = 'data:image/jpeg;base64, ' + Buffer.from(data, 'binary').toString('base64');        
    // imgCache[url] = base64;
    // return base64;
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
  await sleep(200);
  console.log('ok');
  res.json(convertImg2Local(productCollections));
});

router.get('/touristRoutes/:touristRouteId', async function (req, res, next) {
  for (let i = 0; i < touristRouteDetails.length; i++) {
    let route = touristRouteDetails[i];
    if (route.id === req.params.touristRouteId) {
      return res.json(convertDetailFeature2Local(convertImg2Local(route)));
    }
  }
  res.status(422).json(touristRouteNotFound);
})

router.get('/touristRoutes', async function (req, res, next) {
  let routes = touristRoutes;
  if (req.query.keyword) {
    routes = routes.filter((i, n) => {
      return i.title.includes(req.query.keyword);
    })
  }
  if (routes.length == 0) {
    return res.status(404).json("没有旅游路线");
  }
  console.log('routes.length=', routes.length);

  let totalCount = routes.length;
  let pageSize = 10;
  if (req.query.pageSize) {
    if (req.query.pageSize < 1 || req.query.pageSize > 100) {
      pageSize = 10;
    } else {
      pageSize = parseInt(req.query.pageSize);
    }
  }
  console.log('pageSize=', pageSize);

  let pageNumber = 1;
  let totalPages = parseInt(routes.length / pageSize);
  if (parseInt(routes.length % pageSize)) {
    totalPages += 1;
  }
  console.log('totalPages=', totalPages);

  if (req.query.pageNumber) {
    if (req.query.pageNumber >= 1 && req.query.pageNumber <= totalPages) {
      pageNumber = parseInt(req.query.pageNumber);
    }
  }

  let out = [];
  //console.log(routes);
  for (let i = (pageNumber - 1) * pageSize; i < routes.length && i < pageNumber * pageSize; i++) {
    out.push(routes[i]);
  }
  //console.log(out);

  let url = req.url;

  let previousPageLink = null;
  if (pageNumber > 1) {
    previousPageLink = url + `?pageNumber=${pageNumber - 1}&pageSize=${pageSize}`;
    if (req.query.keyword) {
      previousPageLink += "&keyword=" + req.query.keyword;
    }
  }

  let nextPageLink = null;
  if (pageNumber < totalPages) {
    nextPageLink = url + `?pageNumber=${pageNumber + 1}&pageSize=${pageSize}`;
    if (req.query.keyword) {
      nextPageLink += "&keyword=" + req.query.keyword;
    }
  }

  let pagination = {
    "previousPageLink": previousPageLink,
    "nextPageLink": nextPageLink,
    "totalCount": totalCount,
    "pageSize": pageSize,
    "currentPage": pageNumber,
    "totalPages": totalPages
  };

  res.set('x-pagination', JSON.stringify(pagination));

  return res.json(convertImg2Local(out));
})


// const findRoute = (id) => {
//   for (let route of touristRoutes) {
//     if (route.id === id) {
//       return route;
//     }
//   }
//   return null;
// }

// const getItems = (user) => {
//   return {
//     id: user.id,
//     userId: user.id,
//     shoppingCartItems: [...user.cart.map((item) => {
//       return {
//         id: item.id,
//         touristRouteId: item.touristRouteId,
//         originalPrice: item.originalPrice,
//         price: item.price,
//         touristRoute: findRoute(item.touristRouteId),
//       }
//     })],
//   };
// }

// router.get('/shoppingCart', async (req, res, next) => {
//   if (!req.auth || !req.auth.email) {
//     return res.status(401).json("unortherized");
//   }
//   const user = userdb.getUser(req.auth.email);
//   return res.status(200).json(getItems(user));
// });

// router.post('/shoppingCart/items', async (req, res, next) => {
//   if (!req.auth || !req.auth.email) {
//     return res.status(401).json("unortherized");
//   }
//   if (!req.body.touristRouteId) {
//     return res.status(422).json("touristRouteId required");
//   }

//   const route = findRoute(req.body.touristRouteId);
//   let user = userdb.addCartItem(req.auth.email, req.body.touristRouteId, route.originalPrice, route.price);
//   return res.status(200).json(getItems(user));
// });

// router.delete('/shoppingCart/items/:id', async (req, res, next) => {
//   if (!req.auth || !req.auth.email) {
//     return res.status(401).json("unortherized");
//   }
//   console.log(req.params);
//   let ids = [];
//   if (req.params.id.startsWith('(') && req.params.id.endsWith(')')) {
//     let range = [];
//     req.params.id.slice(1, req.params.id.length - 1).split(',').forEach((id) => { range.push(parseInt(id.trim())); });
//     if (range.length >= 2) {
//       for (let i = range[0]; i <= range[range.length - 1]; i++) {
//         ids.push(i);
//       }
//     }
//   } else {
//     ids.push(parseInt(req.params.id));
//   }
//   console.log('ids', ids);
//   userdb.removeCartItems(req.auth.email, ids);
//   return res.status(204).end();
// });

// router.delete('/shoppingCart/items', async (req, res, next) => {
//   if (!req.auth || !req.auth.email) {
//     return res.status(401).json("unortherized");
//   }
//   userdb.clearCart(req.auth.email);
//   return res.status(204).end();
// });


module.exports = router;