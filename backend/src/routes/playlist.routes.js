import express from "express";

import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  addProblemToPlaylist,
  createPlaylist,
  deletePlaylist,
  getAllListDetails,
  getPlaylistDetails,
  removeProblemFromPlaylist,
} from "../controller/playlist.controller.js";

const playlistRoute = express.Router();

playlistRoute.get("/", authMiddleware, getAllListDetails);

playlistRoute.get("/:playlistId", authMiddleware, getPlaylistDetails);

playlistRoute.post("/create-playlist", authMiddleware, createPlaylist);

playlistRoute.post("/:playlistId/add-problem",authMiddleware,addProblemToPlaylist);

playlistRoute.delete("/:playlistId", authMiddleware, deletePlaylist);

playlistRoute.delete("/:playlistId/remove-problem",  authMiddleware,  removeProblemFromPlaylist);

export default playlistRoute;
