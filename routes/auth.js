var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('../config');

let users = {};

router.post('/register', async function (req, res, next) {
    console.log(req.body);
    if (!req.body.email || !req.body.password || !req.body.confirmPassword) {
        return res.status(422).json("email, passowrd and confirmPassword requried");
    }

    users[req.body.email] = {
        password: req.body.password,        
    }

    return res.status(204).end();
});

router.post('/signin', async function (req, res, next) {
    console.log(req.body);
    if (!req.body.email || !req.body.password) {
        return res.status(422).json("email, passowrd and confirmPassword requried");
    }
    if (!users.hasOwnProperty(req.body.email)) {
        return res.status(401).json("unauthorized");
    }
    if (users[req.body.email].password !== req.body.password) {
        return res.status(401).json("unauthorized");
    }

    const token = jwt.sign({ email: req.body.email }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
    return res.status(200).json({
        token: token,
    });
});


module.exports = router;