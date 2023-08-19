import { validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const runValidation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("runValidation");
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
    });
  }
  next();
};
