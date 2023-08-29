var express = require('express');
var router = express.Router();
const productCollections = require('./productCollections');
const touristRoutes = require('./touristRoutes.json');
const touristRouteNotFound = require('./touristRouteNotFound.json');

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}
  
/* GET home page. */
router.get('/productCollections', async function (req, res, next) {
    const key = req.headers['x-icode'];
    if (!key) {
        console.log(req.headers);
        return res.status(400).json({
            status: 400,
            msg: 'x-icode required',
        });
    }
    const apiKeys = ['foo', 'bar', 'baz'];
    if (apiKeys.indexOf(key) === -1) {
        return res.status(400).json({
            status: 400,
            msg: 'invalid x-icode',
        });
    }
    
    console.log('sleeping...');
    await sleep(1000);
    console.log('ok');
    res.json(productCollections);
});

router.get('/touristRoutes/:touristRouteId', async function (req, res, next) {
    for (let i = 0; i < touristRoutes.length; i++){
        let route = touristRoutes[i];
        if (route.id === req.params.touristRouteId) {
            return res.json(route);
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
    for (let i = (pageNumber - 1) * pageSize; i < routes.length && i <  pageNumber * pageSize; i++){
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

    res.set('x-pagination',JSON.stringify(pagination));
    
    return res.json(out);
})

module.exports = router;