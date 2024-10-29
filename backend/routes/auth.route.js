import express from "express";
import { login, logout, signup } from "../controllers/auth.controller.js";

const router = express.Router();

// connect to auth.controller.js
// func get for testing is it working
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

export default router