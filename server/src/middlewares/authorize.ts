import { Request, Response, NextFunction } from "express";

// Reusable middleware that checks if the user has one of the allowed roles
export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const userRole = req.user?.role;

      if (!userRole || !allowedRoles.includes(userRole)) {
        res.status(403);
        throw new Error("Access denied: Insufficient permissions");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
