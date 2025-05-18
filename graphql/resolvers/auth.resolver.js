import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../../models/user.model.js";
import { GraphQLError } from "graphql";
import fetch from "node-fetch";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key";
const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY;

const verifyCaptcha = async (token) => {
  const res = await fetch(
    `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET}&response=${token}`,
    {
      method: "POST",
    }
  );

  const data = await res.json();
  console.log("RECAPTCHA_SECRET_KEY:", RECAPTCHA_SECRET);
  return data.success;
};

export const authResolvers = {
  Mutation: {
    async registerUser(_, { input }) {
      const { email, username, password } = input;

      const existing = await User.findOne({ email });

      if (existing) {
        const error = new GraphQLError("Email already in use");
        error.extensions = {
          code: "EMAIL_EXISTS",
        };
        throw error;
      }

      const hash = await bcrypt.hash(password, 10);

      const user = await User.create({
        email,
        username,
        password_hash: hash,
        created: new Date(),
      });

      const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });

      return { token, user };
    },

    async loginUser(_, { input, recaptchaToken }) {
      const { email, password } = input;

      const user = await User.findOne({ email });
      if (!user) throw new GraphQLError("User not found");

      if (password === "social-login") {
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
          expiresIn: "7d",
        });
        return { token, user };
      }

      if (!recaptchaToken) {
        throw new GraphQLError("Missing reCAPTCHA token", {
          extensions: { code: "RECAPTCHA_REQUIRED" },
        });
      }

      const isHuman = await verifyCaptcha(recaptchaToken);
      if (!isHuman) {
        throw new GraphQLError("reCAPTCHA validation failed", {
          extensions: { code: "RECAPTCHA_FAILED" },
        });
      }

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) throw new GraphQLError("Invalid credentials");

      const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });

      return { token, user };
    },
  },
};
