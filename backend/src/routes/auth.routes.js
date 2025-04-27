import express from "express";
import {
  check,
  forgotPassword,
  getAllUsers,
  googleAuth,
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

authRoute.post("/fogotpassword", forgotPassword);

authRoute.post("/resetpassword/:token/:userId", resetPassword);

authRoute.get("/getAllUsers", getAllUsers);

authRoute.get("/callback", googleAuth);

authRoute.get("/google", (req, res) => {
  // const redirectUri = `${process.env.CLIENT_URL}/auth/callback`;
  const url = `https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?client_id=74160951314-fqg428m8fcl6eq9pc0svlnhojfhcnv18.apps.googleusercontent.com&scope=openid%20email%20profile&response_type=code&redirect_uri=http://localhost:8080/api/v1/auth/callback&response_mode=form_post&display=popup&prompt=select_account`;
  res.redirect(url);
});

// authRoute.get("/auth/callback", (req, res) => {
//   res.send("Google Auth Callback");
// });

export default authRoute;
