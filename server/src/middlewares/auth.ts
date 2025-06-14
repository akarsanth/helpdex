import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/user-model";

export const protect = asyncHandler(
  async (req, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    let token;

    if (authHeader && authHeader.startsWith("Bearer")) {
      try {
        token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
          _id: string;
        };

        const user = await User.findById(decoded._id).select("-password");
        if (!user) {
          res.status(401);
          throw new Error("User not found");
        }

        req.user = user;

        next();
      } catch (err) {
        res.status(401);
        throw new Error("Not authorized, token failed");
      }
    } else {
      res.status(401);
      throw new Error("Not authorized, no token");
    }
  }
);
