import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { ObjectId } from "mongodb";

import { getDatabase } from "./db.js";

function getUsersCollection() {
  return getDatabase().collection("users");
}

passport.use(
  new LocalStrategy(
    {
      passwordField: "password",
      usernameField: "email",
    },
    async (email, password, done) => {
      try {
        const normalizedEmail = email.trim().toLowerCase();
        const user = await getUsersCollection().findOne({
          email: normalizedEmail,
        });

        if (!user) {
          return done(null, false, { message: "Invalid email or password." });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);

        if (!isMatch) {
          return done(null, false, { message: "Invalid email or password." });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    },
  ),
);

passport.serializeUser((user, done) => {
  done(null, user._id.toString());
});

passport.deserializeUser(async (userId, done) => {
  try {
    if (!ObjectId.isValid(userId)) {
      done(null, false);
      return;
    }

    const user = await getUsersCollection().findOne({
      _id: new ObjectId(userId),
    });

    done(null, user || false);
  } catch (error) {
    done(error);
  }
});

export default passport;
