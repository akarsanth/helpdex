import { Request, Response, NextFunction } from "express";

// Not found error
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Custom Error handler
export const defaultErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("In default error handler");

  // If everything is working correctly, the error handler should never be reached when a 200 response is expected.
  // sometimes 500 error is shown as 200
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode);

  // this will be set in data property (of error.response)
  res.json({
    message: err.message,
    status: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};
