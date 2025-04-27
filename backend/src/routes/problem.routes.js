import { createProblem, getAllProblems,getProblemById,updateProblemById, deleteProblem, getAllSolvedProblemsByUser } from "../controller/problem.controller.js";
import { authMiddleware, checkAdmin } from "../middleware/auth.middleware.js";
import express from "express";
const problemRoute = express.Router();


problemRoute.post("/create-problem", authMiddleware,checkAdmin, createProblem)
problemRoute.get("/get-all-problems", authMiddleware, getAllProblems);
problemRoute.get("/get-problem/:id", authMiddleware, getProblemById);
problemRoute.put("/update-problem/:id", authMiddleware,checkAdmin, updateProblemById);
problemRoute.delete("/delete-problem/:id", authMiddleware,checkAdmin, deleteProblem);
problemRoute.get("/get-solved-problems", authMiddleware, getAllSolvedProblemsByUser);


export default problemRoute;