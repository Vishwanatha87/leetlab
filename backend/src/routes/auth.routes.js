import express from "express";
import {
  check,
  login,
  logout,
  register,
  verifyUser,
} from "../controller/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const authRoute = express.Router();

authRoute.post("/register", register);
authRoute.get("/verify/:token/:userId", verifyUser);

authRoute.post("/login", login);

authRoute.post("/logout", authMiddleware, logout);

authRoute.get("/check", authMiddleware, check);

export default authRoute;
