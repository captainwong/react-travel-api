var express = require('express');
var router = express.Router();

router.post('/register', async function (req, res, next) {
    console.log(req.body);
    if (!req.body.email || !req.body.password || !req.body.confirmPassword) {
        return res.status(422).json("email, passowrd and confirmPassword requried");
    }

    return res.status(204).end();
});


module.exports = router;