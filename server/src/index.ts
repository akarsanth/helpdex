import express from "express";
import { notFound, defaultErrorHandler } from "./middlewares/error-middlewares";
import "dotenv/config";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb";

const app = express();
const PORT = process.env.PORT || 5001;
connectDB();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// body parser
app.use(express.json());

// morgan, helmet, cors, and cookie parser
app.use(helmet());
app.use(cors({ credentials: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello, Welcome to helpdex server!");
});

// to handle invalid page
// incase user goes to invalid url
app.use(notFound);

// custom error middleware
// midddleware is a function that
// has access to the request and response cycle objects
app.use(defaultErrorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
