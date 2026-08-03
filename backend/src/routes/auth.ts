import { Router } from "express";
import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { config } from "../config";
import logger from "../utils/logger";
import { register, login, getMe, refreshAccessToken } from "../services/authService";

const router = Router();

const generateTokens = (user: { id: string; email: string; role: string }) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    config.jwt.secret as jwt.Secret,
    { expiresIn: config.jwt.expiresIn }
  );
  const refreshTokenValue = jwt.sign(
    { id: user.id, type: "refresh" },
    config.jwt.refreshSecret as jwt.Secret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );
  return { accessToken, refreshToken: refreshTokenValue };
};

router.post(
  "/register",
  [
    body("name").trim().isLength({ min: 1 }).withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
    body("cooperativeId").optional().isString(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { name, email, password, cooperativeId } = req.body;
      const hashedPassword = await bcrypt.hash(password, 12);

      const user = await register({
        name,
        email,
        password: hashedPassword,
        cooperativeId,
      });

      const tokens = generateTokens(user);
      res.status(201).json({ success: true, data: { user, ...tokens } });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { email, password } = req.body;
      const user = await login(email, password);

      if (!user) {
        return res.status(401).json({
          success: false,
          error: { message: "Invalid email or password", statusCode: 401 },
        });
      }

      const tokens = generateTokens(user);
      res.json({ success: true, data: { user, ...tokens } });
    } catch (error) {
      next(error);
    }
  }
);

router.get("/me", async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, error: { message: "No token provided", statusCode: 401 } });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, config.jwt.secret) as { id: string };
    const user = await getMe(decoded.id);

    if (!user) {
      return res.status(404).json({ success: false, error: { message: "User not found", statusCode: 404 } });
    }

    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/refresh",
  async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ success: false, error: { message: "Refresh token required", statusCode: 400 } });
      }

      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as { id: string };
      const user = await getMe(decoded.id);

      if (!user) {
        return res.status(401).json({ success: false, error: { message: "Invalid refresh token", statusCode: 401 } });
      }

      const tokens = generateTokens(user);
      res.json({ success: true, data: tokens });
    } catch (error) {
      next(error);
    }
  }
);

export default router;