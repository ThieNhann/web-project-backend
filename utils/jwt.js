// const jwt = require('jsonwebtoken');
import jwt from "jsonwebtoken";

function signToken(payload, expiresIn = "7d") {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

export { signToken, verifyToken };
