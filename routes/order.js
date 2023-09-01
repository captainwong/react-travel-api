const express = require('express');
const router = express.Router();
const userdb = require('../data/userdb');
const findRoute = require('../data/findRoute');
const paginate = require('../util/paginate');
const checkAuth = require('../middleware/auth');

router.use(checkAuth);

router.get('/', async (req, res, next) => {
  let theOrders = userdb.orders(req.auth.email);
  let orders = [];
  if (theOrders) {
    orders = theOrders.map((order) => {
      return {
        id: order.id,
        userId: order.id,
        orderItems: order.orderItems.map((item) => {
          return {
            id: item.id,
            touristRouteId: item.touristRouteId,
            touristRoute: findRoute(item.touristRouteId),
          }
        }),
      }
    })
  }

  let out = paginate(req, orders);
  res.set('x-pagination', JSON.stringify(out.pagination));
  return res.status(200).json(out.data);
})


module.exports = router;