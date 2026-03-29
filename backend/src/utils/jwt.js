

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

//////////////////////////////////////////////////////
// 🔐 GENERATE TOKEN
//////////////////////////////////////////////////////
export const generateToken = (user) => {
  if (!user?.id || !user?.role) {
    throw new Error("Invalid user data for token");
  }

  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  return jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
    }
  );
};

//////////////////////////////////////////////////////
// 🔍 VERIFY TOKEN (🔥 NEW ADD)
//////////////////////////////////////////////////////
export const verifyToken = (token) => {
  if (!token) {
    throw new Error("Token is required");
  }

  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  return jwt.verify(token, JWT_SECRET);
};