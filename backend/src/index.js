import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import cors from "cors";

import problemRoute from "./routes/problem.routes.js";
import authRoute from "./routes/auth.routes.js";
import executeCodeRoute from "./routes/execute-code.routes.js";
import submissionRoute from "./routes/submission.routes.js";
import playlistRoute from "./routes/playlist.routes.js";

dotenv.config();
const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.get("/", (req, res) => {
  res.send("Hello Guys welcome to leetlab🔥");
});

// routes
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/problem", problemRoute);
app.use("/api/v1/execute-code", executeCodeRoute);
app.use("/api/v1/submission", submissionRoute);
app.use("/api/v1/playlist", playlistRoute);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
