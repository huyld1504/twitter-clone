import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
    try {
        const { username, email, fullName, password } = req.body;

        if (username.trim() === "" || email.trim() === "" || fullName.trim() === "" || password.trim() === "") {
            return res.status(400).json({ message: "All fields are required" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: "Email is already existed!" });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username is already existed!" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        //Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            fullName,
            email,
            password: hashedPassword
        });

        if (newUser) {
            generateTokenAndSetCookie(newUser._id, res);
            await newUser.save();

            res.status(200).json({
                success: true,
                message: "Sign up successfully",
                data: {
                    _id: newUser._id,
                    fullName: newUser.fullName,
                    username: newUser.username,
                    email: newUser.email,
                    followers: newUser.followers,
                    following: newUser.following,
                    profileImage: newUser.profileImage,
                    coverImage: newUser.coverImage,
                    likedPosts: newUser.likedPosts,
                    link: newUser.link,
                    bio: newUser.bio,
                    createdAt: newUser.createdAt
                }
            });
        } else {
            res.status(400).json({ message: "Invalid user data!" });
        }
    } catch (error) {
        res.status(500).json({ message: "Interval Server Error!" });
        console.log(error);
    }
}

export const signin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username: username });
        const isMatchedPassword = await bcrypt.compare(password, user?.password || "");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!isMatchedPassword) {
            return res.status(400).json({ message: "Password not match" });
        }

        generateTokenAndSetCookie(user._id, res);

        return res.status(200).json({
            success: true,
            message: "Log in successfully",
            data: {
                _id: user._id,
                username: user.username,
                fullName: user.fullName,
                email: user.email,
                followers: user.followers,
                following: user.following,
                profileImage: user.profileImage,
                coverImage: user.coverImage,
                likedPosts: user.likedPosts,
                link: user.link,
                bio: user.bio,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Interval Server Error!" });
        console.log(error.message);
    }
}

export const logout = async (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Interval Server Error!" });
    }
}

export const getCookieUser = async (req, res) => {
    try {
        const cookieUser = await User.findById(req.user._id).select("-password");

        return res.status(200).json(cookieUser);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Interval Server Error!" });
    }
};

