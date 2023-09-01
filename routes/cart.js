var express = require('express');
var router = express.Router();
const userdb = require('../data/userdb');
const findRoute = require('../data/findRoute');
const checkAuth = require('../middleware/auth');

router.use(checkAuth);

const getCartItems = (user) => {
  return {
    id: user.cart.id,
    userId: user.id,
    shoppingCartItems: [...user.cart.items.map((item) => {
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
  return res.status(200).json(getCartItems(req.user));
});

router.post('/items', async (req, res, next) => {
  if (!req.body.touristRouteId) {
    return res.status(422).json("touristRouteId required");
  }

  const route = findRoute(req.body.touristRouteId);
  let user = userdb.addCartItem(req.user, req.body.touristRouteId, route.originalPrice, route.price);

  return res.status(200).json(getCartItems(user));
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
  userdb.removeCartItems(req.user, ids);
  return res.status(204).end();
});

router.delete('/items', async (req, res, next) => {
  userdb.clearCart(req.user);
  return res.status(204).end();
});

router.post('/checkout', async (req, res, next) => {
  let theOrder = userdb.checkout(req.user);
  if (!theOrder) {
    return res.status(400).json({
      msg: "cart is empty"
    });
  }
  let order = {
    id: theOrder.id,
    userId: req.user.id,
    orderItems: theOrder.orderItems.map((item) => {
      return {
        id: item.id,
        touristRouteId: item.touristRouteId,
        touristRoute: findRoute(item.touristRouteId),
      }
    }),
  };

  return res.status(200).json(order);
});

module.exports = router;
