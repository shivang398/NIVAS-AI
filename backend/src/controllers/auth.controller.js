import prisma from "../config/prisma.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { asyncHandler } from "../utils/asyncHandler.js";
import { success, created } from "../utils/response.js";
import { AppError } from "../utils/AppError.js";


export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError("User already exists", 400);
  }

  // Validate and format role
  const validRoles = ["TENANT", "OWNER", "POLICE"];
  const userRole = role ? role.toUpperCase() : "TENANT";

  if (!validRoles.includes(userRole)) {
    throw new AppError("Invalid role. Must be TENANT, OWNER, or POLICE.", 400);
  }


  const hashedPassword = await bcrypt.hash(password, 10);


  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: userRole,
    },
  });


  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
      isVerified: user.isVerified,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return created(
    res,
    { token, role: user.role, isVerified: user.isVerified },
    "User registered successfully"
  );
});


export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;


  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError("User not found", 400);
  }


  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new AppError("Invalid credentials", 400);
  }


  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
      isVerified: user.isVerified,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return success(
    res,
    { token, role: user.role, isVerified: user.isVerified },
    "Login successful"
  );
});