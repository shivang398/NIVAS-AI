import prisma from "../config/prisma.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { generateToken } from "../utils/jwt.js";
import { AppError } from "../utils/AppError.js";

export const registerUser = async ({ name, email, password, role }) => {
  if (!name || !email || !password || !role) {
    throw new AppError("All fields are required", 400);
  }

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    throw new AppError("User already exists", 400);
  }

  const hashed = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      role,
    },
  });

  const token = generateToken({
    id: user.id,
    role: user.role,
  });

  const { password: _, ...safeUser } = user;

  return {
    user: safeUser,
    token,
  };
};


export const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError("Invalid credentials", 400);
  }

  const isMatch = await comparePassword(password, user.password);

  if (!isMatch) {
    throw new AppError("Invalid credentials", 400);
  }

  const token = generateToken({
    id: user.id,
    role: user.role,
  });

  const { password: _, ...safeUser } = user;

  return {
    user: safeUser,
    token,
  };
};