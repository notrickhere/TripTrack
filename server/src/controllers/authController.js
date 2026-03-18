import bcrypt from "bcrypt";

import { getDatabase } from "../config/db.js";
import { signAuthToken } from "../middleware/authMiddleware.js";

function getUsersCollection() {
  return getDatabase().collection("users");
}

function sanitizeUser(user) {
  return {
    _id: user._id,
    email: user.email,
    name: user.name,
  };
}

export async function registerUser(request, response) {
  const { email = "", name = "", password = "" } = request.body;

  if (!email || !name || !password) {
    return response
      .status(400)
      .json({ message: "Name, email, and password are required." });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await getUsersCollection().findOne({ email: normalizedEmail });

  if (existingUser) {
    return response.status(409).json({ message: "An account already exists for that email." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    createdAt: new Date(),
    email: normalizedEmail,
    name: name.trim(),
    passwordHash,
  };

  const result = await getUsersCollection().insertOne(user);
  const createdUser = { ...user, _id: result.insertedId };
  const authUser = sanitizeUser(createdUser);

  return response.status(201).json({
    token: signAuthToken({ email: authUser.email, userId: authUser._id.toString() }),
    user: authUser,
  });
}

export async function loginUser(request, response) {
  const { email = "", password = "" } = request.body;

  if (!email || !password) {
    return response.status(400).json({ message: "Email and password are required." });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await getUsersCollection().findOne({ email: normalizedEmail });

  if (!user) {
    return response.status(401).json({ message: "Invalid email or password." });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) {
    return response.status(401).json({ message: "Invalid email or password." });
  }

  const authUser = sanitizeUser(user);

  return response.json({
    token: signAuthToken({ email: authUser.email, userId: authUser._id.toString() }),
    user: authUser,
  });
}

export function getCurrentUser(request, response) {
  return response.json({
    user: {
      _id: request.user.userId,
      email: request.user.email,
    },
  });
}
