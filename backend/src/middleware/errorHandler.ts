import { NextFunction, Request, Response } from "express";

export default function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(err);
  if (res.headersSent) {
    return next(err);
  }
  const status = err.status || 500;
  res.status(status).json({ message: err.message || "Server error" });
}
