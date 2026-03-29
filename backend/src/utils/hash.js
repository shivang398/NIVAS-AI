

import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

//////////////////////////////////////////////////////
// 🔐 HASH PASSWORD
//////////////////////////////////////////////////////
export const hashPassword = async (password) => {
  if (!password) {
    throw new Error("Password is required");
  }

  return bcrypt.hash(password, SALT_ROUNDS);
};

//////////////////////////////////////////////////////
// 🔍 COMPARE PASSWORD
//////////////////////////////////////////////////////
export const comparePassword = async (password, hash) => {
  if (!password || !hash) {
    throw new Error("Password and hash are required");
  }

  return bcrypt.compare(password, hash);
};