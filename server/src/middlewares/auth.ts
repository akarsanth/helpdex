import jwt from "jsonwebtoken";
import User from "../models/user-model";
import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";

export const protect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      try {
        token = req.headers.authorization.split(" ")[1];
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
      } catch (error) {
        res.status(401);
        throw new Error("Not authorized, token failed");
      }
    } else {
      res.status(401);
      throw new Error("Not authorized, no token");
    }
  }
);
