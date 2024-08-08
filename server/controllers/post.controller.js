import Notification from "../models/notification.model.js";
import Post from "../models/posts.model.js";
import User from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";

export const createPost = async (req, res) => {
    try {
        const { caption } = req.body;
        let { img } = req.body;

        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        if (!caption && !img) {
            return res.status(400).json({ success: false, message: "Post must have text or image" });
        }

        if (img) {
            const uploadedImg = await cloudinary.uploader.upload(img);
            img = uploadedImg.secure_url;
        }

        const newPost = new Post({
            user: userId,
            caption,
            img
        });

        await newPost.save();
        res.status(201).json({ success: true, message: "Created post successfully", data: newPost });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error });
    }
}

export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post Not Found" });
        }

        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: "Unauthorized to access this resource" });
        }

        if (post.img) {
            const imgId = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId);
        }

        await Post.findByIdAndDelete(req.params.id);
        res.status(201).json({ success: true, message: "Post deleted successfully" });
    } catch (error) {
        console.log(err.message)
        res.status(500).json({ success: false, message: error.message });
    }
}

export const commentOnPost = async (req, res) => {
    const result = {
        success: false,
        message: "",
        data: []
    };

    try {
        const { text } = req.body;
        const postId = req.params.id;
        const userId = req.user._id;

        if (!text) {
            result.message = "Caption field is required";
            return res.status(400).json(result);
        }

        const post = await Post.findById(postId);
        if (!post) {
            result.message = "Post not found";
            return res.status(404).json(result);
        }

        const comment = { user: userId, text };
        post.comments.push(comment);
        await post.save();

        result.success = true;
        result.message = "You commented successfully";
        result.data = post;
        res.status(200).json(result);
    } catch (error) {
        console.log(err);
        result.message = err.message;
        res.status(500).json(result);
    }
}

export const likeUnlikePost = async (req, res) => {
    const result = {
        success: false,
        message: ""
    }

    try {
        const userId = req.user._id;
        const { id: postId } = req.params;

        const post = await Post.findById(postId);
        if (!post) {
            result.message = "Post Not Found";
            return res.status(404).json(result);
        }

        const userLikedPost = post.likes.includes(userId);

        if (userLikedPost) {
            //Unlike post
            await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
            await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });
            result.success = true;
            result.message = "Unliked post successfully";
            res.status(200).json(result);
        } else {
            //Like post
            post.likes.push(userId);
            await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
            await post.save();
            result.message = "Liked post successfully";
            result.success = true;

            const notification = new Notification({
                from: userId,
                to: post.user,
                type: "like"
            });
            await notification.save();

            res.status(200).json(result);
        }
    } catch (error) {
        console.log(err);
        result.message = err.message;
        res.status(500).json(result);
    }
}

export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }).populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: "-password"
        });

        if (posts.length === 0) {
            return res.status(200).json({ message: "No Posts", data: [] });
        }

        res.status(200).json(posts)
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}

export const getLikedPost = async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User Not Found" });

        const likedPosts = await Post.find({ _id: { $in: user.likedPosts } }).populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: "-password"
        });

        res.status(200).json({success: true, data: likedPosts});
    } catch (error) {
        console.log(err);
        res.status(500).json({message: error.message});
    }
}

export const getFollowingPosts = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User Not Found" });

        const following = user.following;

        const feedPosts = await Post.find({user: {$in: following}}).sort({createdAt: -1}).populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: "-password"
        });

        res.status(200).json({success: true, data: feedPosts})

    } catch (error) {
        console.log(error),
        res.status(500).json({success: false, message: error.message});
    }
}

export const getUserPosts = async (req, res) => {
    try {
        const {username} = req.params;
        const user = await User.findOne({username});
        if (!user) return res.status(404).json({ success: false, message: "User Not Found" });

        const posts = await Post.find({user: user._id}).sort({createdAt: -1}).populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: "-password"
        })

        res.status(200).json({success: true, data: posts});
    } catch (error) {
        console.log(error);
        res.status(500).json({success: false, message: error.message});
    }
}

