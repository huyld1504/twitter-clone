import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import MongooseClient from "./db/connectMongoDB.js";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

const app = express();

app.use(express.json()); //to parse req.body 
app.use(express.urlencoded({extended: true})); // to parse form data

app.use(cookieParser());
app.use(cors());


app.use("/api/auth", authRoutes);

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    MongooseClient();
})