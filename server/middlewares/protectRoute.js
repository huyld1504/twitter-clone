import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({message: "Unauthorized: No token provided"});
        }

        const decoded = jwt.verify(token, process.env.SECRET_TOKEN);

        if (!decoded) {
            return res.status(401).json({message: "Unauthorized: Invalid token"});
        }

        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(404).json({message: "User not found"});
        }

        req.user = user;
        next();
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({message: "Interval server error"});
    }
}