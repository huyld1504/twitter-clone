import express from "express";
import dotenv from "dotenv";
import MongooseClient from "./db/connectMongoDB.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import {v2 as cloudinary} from "cloudinary";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import notificationRoutes from "./routes/notification.route.js";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();

app.use(express.json({limit: "5mb"})); //to parse req.body DoS attack
app.use(express.urlencoded({extended: true})); // to parse form data

app.use(cookieParser());
app.use(cors());


app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    MongooseClient();
});