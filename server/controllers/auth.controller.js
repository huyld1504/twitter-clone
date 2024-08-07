import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

const signup = async (req, res) => {
    try {
        const { username, email, fullName, password } = req.body;

        const existingUser = await User.findOne({ username: username });

        const existingEmail = await User.findOne({ email: email });

        if (existingUser) {
            res.status(400).json({ message: "Username is already existed!" });
        }

        if (existingEmail) {
            res.status(400).json({ message: "Email is already existed!" });
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

            return res.status(200).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                followers: newUser.followers,
                following: newUser.following,
                profileImage: newUser.profileImage,
                coverImage: newUser.coverImage
            });
        } else {
            res.status(400).json({ message: "Invalid user data!" });
        }
    } catch (error) {
        res.status(500).json({ message: "Interval Server Error!" });
        console.log(error.message);
    }
}

const signin = async (req, res) => {
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
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            followers: user.followers,
            following: user.following,
            profileImage: user.profileImage,
            coverImage: user.coverImage
        });
    } catch (error) {
        res.status(500).json({ message: "Interval Server Error!" });
        console.log(error.message);
    }
}
const logout = async (req, res) => {
    try {
        res.cookie("jwt", "", {maxAge: 0});
        res.status(200).json({message: "Logged out successfully"});
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Interval Server Error!" });
    }
}

const getCookieUser = async (req, res) => {
    try {
        const cookieUser = await User.findById(req.user._id).select("-password");

        return res.status(200).json(cookieUser);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Interval Server Error!" });
    }
}

export { signin, signup, logout, getCookieUser };
