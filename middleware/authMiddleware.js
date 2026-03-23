// middleware/authMiddleware.js
// This file checks if a user is logged in before allowing access to protected routes.

const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  let token;

  // JWT is typically sent in the Authorization header as: "Bearer <token>"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract the token (remove "Bearer " prefix)
      token = req.headers.authorization.split(" ")[1];

      // Verify the token using your secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user info to the request so routes can use it
      req.user = decoded;

      next(); // Allow the request to continue
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = protect;
