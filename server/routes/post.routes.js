import express from "express";
import { protectRoute } from "../middlewares/protectRoute.js";
import { createPost, deletePost, commentOnPost, likeUnlikePost } from "../controllers/post.controller.js";

const router = express.Router();

router.post("/create", protectRoute, createPost);
router.delete("/delete/:id", protectRoute, deletePost);
//router.post("/update/:id", protectRoute, updatePost);
router.post("/like/:id", protectRoute,likeUnlikePost);
router.post("/comment/:id", protectRoute,commentOnPost);


export default router;