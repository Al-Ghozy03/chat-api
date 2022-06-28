const jwt = require("jsonwebtoken");
const { usermodel } = require("../model/model");

async function jwtMiddle(req, res, next) {
  const { authorization } = req.headers;
  if (authorization == undefined) return res.sendStatus(401);
  const token = authorization.split(" ")[1];

  jwt.verify(token, process.env.JWT_SIGN, async (err, decode) => {
    if (err) {
      return res.status(401).json({
        message: "invalid token",
        data: err,
      });
    } else {
      const user = await usermodel.findOne({ id: decode.id });
      if (!user)
        return res.json({
          message: "user's has been deleted",
        });
      req.id = decode?.id;
      next();
    }
  });
}
module.exports = {jwtMiddle}
