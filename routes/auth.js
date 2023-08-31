var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('../config');
const sleep = require('./sleep');
const userdb = require('../userdb');

router.post('/register', async function (req, res, next) {
  console.log(req.body);
  if (!req.body.email || !req.body.password || !req.body.confirmPassword) {
    return res.status(422).json("email, passowrd and confirmPassword requried");
  }

  userdb.addUser(req.body.email, req.body.password);

  await sleep(1000); // for Botton loading spin
  return res.status(204).end();
});

router.post('/signin', async function (req, res, next) {
  console.log(req.body);
  if (!req.body.email || !req.body.password) {
    return res.status(422).json("email, passowrd and confirmPassword requried");
  }

  if (!userdb.userExists(req.body.email, req.body.password)) {
    return res.status(401).json("unauthorized");
  }

  const token = jwt.sign({ email: req.body.email }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
  await sleep(1000); // for Botton loading spin
  return res.status(200).json({
    token: token,
  });
});

router.get('/debug', (req, res, next) => {
  return res.status(200).json(userdb.debug());
})

module.exports = router;
