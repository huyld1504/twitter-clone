import express from "express";
import { protectRoute } from "../middlewares/protectRoute.js";
import { getProfileUser, followUnfollowUser, getSuggestedUser, updateProfileUser } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/profile/:id", protectRoute,getProfileUser);
router.get("/suggested",protectRoute , getSuggestedUser);
router.post("/follow/:id", protectRoute, followUnfollowUser);
router.post("/profile/update", protectRoute, updateProfileUser);

export default router;