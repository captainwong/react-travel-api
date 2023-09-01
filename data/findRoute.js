const touristRoutes = require('./touristRoutes.json');
const localize = require('../util/localize');

const findRoute = (id) => {
  for (let route of touristRoutes) {
    if (route.id === id) {
      return localize.convertImg2Local(route);
    }
  }
  return null;
}

module.exports = findRoute;
