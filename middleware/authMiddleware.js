const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, data: "Access Denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.decode(token);
    if (!decoded) {
      return res.status(403).json({ success: false, data: "Unauthenticated User" });
    }

    req.userId = decoded.sub; 
    next();
  } catch (error) {
    return res.status(403).json({ success: false, data: "Unauthenticated User" });
  }
}

module.exports = authMiddleware;
