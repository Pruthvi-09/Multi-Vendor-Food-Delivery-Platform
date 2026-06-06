const jwt = require("jsonwebtoken");

const isAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        error: true,
        message: "token not found",
      });
    }

    const decodeToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodeToken || !decodeToken.userId) {
      return res.status(401).json({
        error: true,
        message: "invalid token",
      });
    }

    console.log(decodeToken);

    req.userId = decodeToken.userId;
    next();
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "isAuth error",
    });
  }
};

module.exports= isAuth