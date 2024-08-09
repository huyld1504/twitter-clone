import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

export const getProfileUser = async (req, res) => {
    const { username } = req.params;

    try {
        const user = await User.findOne({username: username}).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({success: true, data: user});
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message });
    }
}

export const followUnfollowUser = async (req, res) => {
    try {
        const { id } = req.params;

        const userToModify = await User.findById(id);

        const currentUser = await User.findById(req.user._id);

        if (id === req.user._id.toString()) {
            return res.status(400).json({ message: "You can not follow/unfollow yourself" });
        }

        if (!userToModify || !currentUser) return res.status(400).json({ message: "User not found" });

        const isFollowed = currentUser.following.includes(id);
        if (isFollowed) {
            //unfollow the user
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });

            //TODO return the id of the user as a response
            res.status(200).json({ message: "Unfollowed successfully" });
        } else {
            //follow the user
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
            //Send notification to user
            const newNotification = new Notification({
                type: "follow",
                from: req.user._id,
                to: userToModify._id,
            });
            await newNotification.save();
            //TODO return the id of the user as a response
            res.status(200).json({ message: "Followed successfully" });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message });
    }
}

export const getSuggestedUser = async (req, res) => {
    try {
        const userId = req.user._id;

        const userFollowedByCurrentUser = await User.findById(userId).select("following");

        const users = await User.aggregate([
            {
                $match: {
                    _id: { $ne: userId }
                }
            },
            {
                $sample: { size: 10 }
            }
        ]);

        const filteredUser = users.filter((user) => !userFollowedByCurrentUser.following.includes(user._id));

        const suggestedUser = filteredUser.slice(0, 4);

        suggestedUser.forEach(user => user.password = null);

        res.status(200).json(suggestedUser);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message });
    }
}

export const updateProfileUser = async (req, res) => {
    const { fullName, email, username, currentPassword, newPassword, bio, link } = req.body;

    let { profileImage, coverImage } = req.body;

    const userId = req.user._id;
    const values = { username, email, fullName, password: "" , bio, link, profileImage, coverImage };

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
            return res.status(400).json({ success: false, message: "Please provide both current password and new password" });
        }

        if (currentPassword && newPassword) {
            const isMatchPassword = await bcrypt.compare(currentPassword, user.password);
            if (!isMatchPassword) {
                return res.status(400).json({ success: false, message: "Current password is incorrect" });
            }
            if (newPassword.length < 6) {
                return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
            }
            if (newPassword === currentPassword) {
                return res.status(400).json({ success: false, message: "You can not use your current password to set your new password" });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedNewPassword = await bcrypt.hash(newPassword, salt);
            values.password = hashedNewPassword;
        } else {
            values.password = user.password;
        }

        if (profileImage) {
            if (user.profileImage) {
                await cloudinary.uploader.destroy(user.profileImage.split("/").pop().split(".")[0]);
            }

            const uploadedResponse = await cloudinary.uploader.upload(profileImage);
            profileImage = uploadedResponse.secure_url;
        }

        if (coverImage) {
            if (user.coverImage) {
                await cloudinary.uploader.destroy(user.coverImage.split("/").pop().split(".")[0]);
            }

            const uploadedResponse = await cloudinary.uploader.upload(coverImage);
            coverImage = uploadedResponse.secure_url;
        }

        await User.findByIdAndUpdate(req.user._id, values);
        return res.status(200).json({ message: "Updated successfully", success: true });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message, success: false });
    }
}