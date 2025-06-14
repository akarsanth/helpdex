import { Request, Response, NextFunction } from "express";

export const authorizeAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.user?.role !== "admin") {
      res.status(403);
      throw new Error("Access denied: Admins only");
    }
    next();
  } catch (error) {
    next(error);
  }
};
