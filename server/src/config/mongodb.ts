import mongoose from "mongoose";
import chalk from "chalk";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI as string);

    console.log(
      chalk.cyan.underline(`MongoDB Connected: ${conn.connection.host}`)
    );
  } catch (error) {
    if (error instanceof Error) {
      console.log(chalk.red.underline.bold(`Error: ${error.message}`));
    } else {
      console.log(chalk.red.underline.bold("Unknown error occurred"));
    }
    process.exit(1);
  }
};

export default connectDB;
