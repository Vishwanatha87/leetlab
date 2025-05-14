import { authMiddleware } from "../middleware/auth.middleware.js";
import express from "express"
import { getAllSubmissions, getSubmissionCountForProblem, getSubmissionForProblem } from "../controller/submission.controller.js";

const submissionRoute = express.Router();


submissionRoute.get("/get-all-submissions", authMiddleware, getAllSubmissions);
submissionRoute.get("/get-submission/:problemId", authMiddleware, getSubmissionForProblem);

submissionRoute.get("/get-submission-count/:problemId", authMiddleware, getSubmissionCountForProblem);

export default submissionRoute;
