const express = require('express');
const router = express.Router();
const sleep = require('../util/sleep');
const paginate = require('../util/paginate');
const cartRouter = require('./cart');
const ordersRouter = require('./order');
const config = require('../config');
const checkIcode = require('../middleware/icode');
const mock = require('../data');
const localize = require('../util/localize');

router.use(checkIcode);
router.use('/shoppingCart', cartRouter);
router.use('/orders', ordersRouter);


router.get('/productCollections', async function (req, res, next) {
  console.log('sleeping...');
  await sleep(config.sleepms);
  console.log('ok');
  res.json(localize.convertImg2Local(mock.productCollections));
});

router.get('/touristRoutes/:touristRouteId', async function (req, res, next) {
  for (let i = 0; i < mock.touristRouteDetails.length; i++) {
    let route = mock.touristRouteDetails[i];
    if (route.id === req.params.touristRouteId) {
      return res.json(localize.convertDetailFeature2Local(localize.convertImg2Local(route)));
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
  return res.json(localize.convertImg2Local(out.data));
})


module.exports = router;