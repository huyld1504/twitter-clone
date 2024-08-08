import express from "express";
import { protectRoute } from "../middlewares/protectRoute.js";
import { createPost, deletePost, commentOnPost, likeUnlikePost, getAllPosts, getLikedPost, getFollowingPosts, getUserPosts } from "../controllers/post.controller.js";

const router = express.Router();

router.get("/all", protectRoute, getAllPosts);
router.get("/likes/:id", protectRoute, getLikedPost);
router.get("/following", protectRoute, getFollowingPosts);
router.get("/user/:username", protectRoute, getUserPosts);
router.post("/create", protectRoute, createPost);
router.delete("/delete/:id", protectRoute, deletePost);
//router.post("/update/:id", protectRoute, updatePost);
router.post("/like/:id", protectRoute,likeUnlikePost);
router.post("/comment/:id", protectRoute,commentOnPost);


export default router;