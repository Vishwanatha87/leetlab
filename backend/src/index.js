import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";


// import all route
import authRoute from "./routes/auth.routes.js";

dotenv.config();
const app = express();


// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.get("/", (req, res) => {
  res.send("Hello Guys welcome to leetlab🔥");
})

// routes
app.use("/api/v1/auth", authRoute)

app.listen(process.env.PORT, () => {
  console.log( `Server is running on port ${process.env.PORT}`);
});
