const checkIcode = async (req, res, next) => {
  const key = req.headers['x-icode'];
  if (!key) {
    console.log(req.headers);
    return res.status(400).json({
      status: 400,
      msg: 'x-icode required',
    });
  }
  const apiKeys = ['foo', 'bar', 'baz', 'D4D928FF7C10128D', 'F5F433A587BDBCC7'];
  if (apiKeys.indexOf(key) === -1) {
    return res.status(400).json({
      status: 400,
      msg: 'invalid x-icode',
    });
  }
  next();
};

module.exports = checkIcode;
