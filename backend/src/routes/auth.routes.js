import express from "express";
import {
  check,
  forgotPassword,
  getAllUsers,
  login,
  logout,
  register,
  resetPassword,
  verifyUser,
} from "../controller/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const authRoute = express.Router();

authRoute.post("/register", register);
authRoute.get("/verify/:token/:userId", verifyUser);

authRoute.post("/login", login);

authRoute.post("/logout", authMiddleware, logout);

authRoute.get("/check", authMiddleware, check);

authRoute.post("/fogotpassword",forgotPassword)

authRoute.post("/resetpassword/:token/:userId",resetPassword)

authRoute.get("/getAllUsers",getAllUsers)

export default authRoute;
