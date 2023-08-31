var express = require('express');
var router = express.Router();
const userdb = require('../userdb');
const jwt = require('jsonwebtoken');
const config = require('../config');
const touristRoutes = require('./touristRoutes.json');
const sleep = require('./sleep');

// router.use((req, res, next) => {
//   if (!req.headers['authorization']) {
//     return res.status(401).json('unortherized');
//   }

//   const data = jwt.verify(req.headers['authorization'], config.jwt.secret);
//   if (!data || !data.email) {
//     return res.status(401).json('unortherized');
//   }

//   req.user = { email: data.email };
// })

async function checkAuth(req, res, next) {
  if (!req.auth || !req.auth.email) {
    return res.status(401).json("unortherized");
  }
  const user = userdb.userExists(req.auth.email);
  if (!user) {
    return res.status(401).json("unortherized");
  }
  req.user = user;
  await sleep(800);
  next();
}

router.use(checkAuth);

const findRoute = (id) => {
  for (let route of touristRoutes) {
    if (route.id === id) {
      return route;
    }
  }
  return null;
}

const getItems = (user) => {
  return {
    id: user.id,
    userId: user.id,
    shoppingCartItems: [...user.cart.map((item) => {
      return {
        id: item.id,
        touristRouteId: item.touristRouteId,
        originalPrice: item.originalPrice,
        price: item.price,
        touristRoute: findRoute(item.touristRouteId),
      }
    })],
  };
}

router.get('/', async (req, res, next) => {
  return res.status(200).json(getItems(req.user));
});

router.post('/items', async (req, res, next) => {
  if (!req.body.touristRouteId) {
    return res.status(422).json("touristRouteId required");
  }

  const route = findRoute(req.body.touristRouteId);
  let user = userdb.addCartItem(req.auth.email, req.body.touristRouteId, route.originalPrice, route.price);

  return res.status(200).json(getItems(user));
});

router.delete('/items/:id', async (req, res, next) => {
  console.log(req.params);
  let ids = [];
  if (req.params.id.startsWith('(') && req.params.id.endsWith(')')) {
    let range = [];
    req.params.id.slice(1, req.params.id.length - 1).split(',').forEach((id) => { range.push(parseInt(id.trim())); });
    if (range.length >= 2) {
      for (let i = range[0]; i <= range[range.length - 1]; i++) {
        ids.push(i);
      }
    }
  } else {
    ids.push(parseInt(req.params.id));
  }
  console.log('ids', ids);
  userdb.removeCartItems(req.auth.email, ids);
  return res.status(204).end();
});

router.delete('/items', async (req, res, next) => {
  if (!req.auth || !req.auth.email) {
    return res.status(401).json("unortherized");
  }
  userdb.clearCart(req.auth.email);
  return res.status(204).end();
});

module.exports = router;
