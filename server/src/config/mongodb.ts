import mongoose from "mongoose";
import chalk from "chalk";
import dotenv from "dotenv";
dotenv.config();

// Function to connect to MongoDB using Mongoose
const connectDB = async () => {
  try {
    // Attempt to connect using the provided MONGO_URI and set dbName explicitly
    const conn = await mongoose.connect(process.env.MONGO_URI as string, {
      dbName: "helpdex", // explicitly sets the database name (helpful for shared clusters)
    });

    // Success log with database host
    console.log(
      chalk.cyan.underline(`MongoDB Connected: ${conn.connection.host}`)
    );
  } catch (error) {
    // Handle known and unknown connection errors
    if (error instanceof Error) {
      console.log(chalk.red.underline.bold(`Error: ${error.message}`));
    } else {
      console.log(chalk.red.underline.bold("Unknown error occurred"));
    }
    process.exit(1); // Exit the process with failure code
  }
};

export default connectDB;
