import mongoose from "mongoose";

let isConnected = false;

export const connectToDB = async () => {
  mongoose.set("strictQuery", true);
  if (!process.env.MONGODB_URL) return console.log("MONGODAH_URL not found");
  if (isConnected) return console.log("MONGODB_ already connected to mongoDB");
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    isConnected = true;
    console.log("MONGODB connected");
  } catch (error) {
    console.log(error);
  }
};
