import mongoose from "mongoose";

const MongooseClient = async () => {
    try {
        const connected = await mongoose.connect(process.env.MONGODB_URL);

        console.log(`MongoDb connected: ${connected.connection.host}`);

    } catch (error) {
        console.log(error.message);
        process.exit(1);
    }
}

export default MongooseClient;