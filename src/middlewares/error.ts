import { CustomError } from "../utils/errors";
import { Response, Request, NextFunction } from "express";

const devErrors = (res: Response, error: Error & CustomError) => {
  res.status(error.statusCode).json({
    status: error.statusCode,
    message: error.message,
    stackTrace: error.stack,
    error: error,
  });
};

const castErrorHandler = (err: Error & any) => {
  const msg = `Invalid value for ${err.path}: ${err.value}!`;
  return new CustomError(msg, 400);
};

const duplicateKeyErrorHandler = (err: Error & any) => {
  const name = err.keyValue.name;
  const msg = `There is already a movie with name ${name}. Please use another name!`;

  return new CustomError(msg, 400);
};

const validationErrorHandler = (err: Error & any) => {
  const errors = Object.values(err.errors).map((val: any) => val.message);
  const errorMessages = errors.join(". ");
  const msg = `Invalid input data: ${errorMessages}`;

  return new CustomError(msg, 400);
};

const prodErrors = (res: Response, error: Error & any) => {
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.statusCode,
      message: error.message,
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "Something went wrong! Please try again later.",
    });
  }
};

export const globalErrorHandler = (
  error: Error & CustomError & any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  if (process.env.NODE_ENV === "development") {
    devErrors(res, error);
  } else if (process.env.NODE_ENV === "production") {
    if (error.name === "CastError") error = castErrorHandler(error);
    if (error.code === 11000) error = duplicateKeyErrorHandler(error);
    if (error.name === "ValidationError") error = validationErrorHandler(error);

    prodErrors(res, error);
  }
};
