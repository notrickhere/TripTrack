import bcrypt from "bcrypt";
import passport from "passport";

import { getDatabase } from "../config/db.js";

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
  const existingUser = await getUsersCollection().findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    return response
      .status(409)
      .json({ message: "An account already exists for that email." });
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

  request.logIn(createdUser, (error) => {
    if (error) {
      response
        .status(500)
        .json({ message: "Registration succeeded, but sign-in failed." });
      return;
    }

    response.status(201).json({
      user: authUser,
    });
  });
}

export function loginUser(request, response, next) {
  passport.authenticate("local", (error, user, info) => {
    if (error) {
      next(error);
      return;
    }

    if (!user) {
      response
        .status(401)
        .json({ message: info?.message || "Invalid email or password." });
      return;
    }

    request.logIn(user, (loginError) => {
      if (loginError) {
        next(loginError);
        return;
      }

      response.json({
        user: sanitizeUser(user),
      });
    });
  })(request, response, next);
}

export function getCurrentUser(request, response) {
  return response.json({
    user: sanitizeUser(request.user),
  });
}

export function logoutUser(request, response, next) {
  request.logout((error) => {
    if (error) {
      next(error);
      return;
    }

    request.session.destroy((sessionError) => {
      if (sessionError) {
        next(sessionError);
        return;
      }

      response.clearCookie("triptrack.sid");
      response.status(204).send();
    });
  });
}
