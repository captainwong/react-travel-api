const userdb = require('../data/userdb');
const sleep = require('../util/sleep');
const config = require('../config');

const checkAuth = async (req, res, next) => {
  if (!req.auth || !req.auth.email) {
    return res.status(401).json("unortherized");
  }
  const user = userdb.userExists(req.auth.email);
  if (!user) {
    return res.status(401).json("unortherized");
  }
  req.user = user;
  await sleep(config.sleepms);
  next();
}

module.exports = checkAuth;
