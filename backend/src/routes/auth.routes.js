import express from "express";
import {
  check,
  login,
  logout,
  register,
} from "../controller/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const authRoute = express.Router();

authRoute.post("/register", register);

authRoute.post("/login", login);

authRoute.post("/logout", authMiddleware, logout);

authRoute.get("/check", authMiddleware, check);

export default authRoute;
