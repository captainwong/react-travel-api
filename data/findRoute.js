const touristRoutes = require('./touristRoutes.json');

const findRoute = (id) => {
  for (let route of touristRoutes) {
    if (route.id === id) {
      return route;
    }
  }
  return null;
}

module.exports = findRoute;
