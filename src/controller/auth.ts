import { Request, Response, NextFunction } from "express";
import AWS from "aws-sdk";
import { userModel } from "../models/user";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Error } from "mongoose";
import { constructEmailParams } from "../utils/email";
import shortId from "shortid";
import { CustomError } from "../utils/errors";
import expressJwt, {
  Params,
  expressjwt,
  Request as JwtRequest,
} from "express-jwt";
import { userExists } from "../utils/utils";

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "eu-north-1",
});

const ses = new AWS.SES();

export const register = (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  // check if user exists in our db
  try {
    userModel
      .findOne({ email })
      .exec()
      .then((user) => {
        if (user) {
          return res.status(400).json({
            error: "Email is taken",
          });
        }
      });
  } catch (error) {
    return res.status(500).json({
      error: "An error occurred while checking the email availability",
    });
  }

  // generate token with user name email and password
  const token = jwt.sign(
    { name, email, password },
    process.env.JWT_ACCOUNT_ACTIVATION!,
    { expiresIn: "10m" }
  );

  const params = constructEmailParams(email, token);

  const sendEmailOnRegister = ses.sendEmail(params).promise();

  sendEmailOnRegister
    .then((data) => {
      console.log("email submitted to SES", data);
      res.send("Email sent");
    })
    .catch((error) => {
      console.log("ses email on register", error);
      res.send("email failed");
    });
};

export const registerationToken = async (req: Request, res: Response) => {
  console.log("registeration token function hit");
  const { token } = req.body;
  jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION!, (error: any) => {
    if (error) {
      console.log("JWT VERIFY IN ACCOUNT ACTIVATION ERROR", error);
      return res.status(401).json({
        error: "Expired link. Try again",
      });
    }
  });

  console.log("decoding token");

  const { name, email, password } = jwt.decode(token) as JwtPayload;
  console.log({ name, email, password });
  const username = shortId.generate();

  // register new user
  const newUser = new userModel({ username, name, email, password });
  try {
    await newUser.save();
    console.log("registration success");
    return res.json({
      message: "Registration success. Please login.",
    });
  } catch (error) {
    return res.status(401).json({
      error: `Error saving user in database. Try later \n ${error}`,
    });
  }
};

export const validateSignIn = expressjwt({
  secret: `${process.env.JWT_SECRET!}`,
  algorithms: ["HS256"] as jwt.Algorithm[],
} as Params);

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await userExists("email", email);

    // authenticate
    if (!user.authenticate(password)) {
      throw new CustomError("Email and password do not match", 400);
    }

    // generate token and send to client
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });
    const { _id, name, role } = user;

    return res.json({
      token,
      user: { _id, name, email, role },
    });
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({
        msg: error.message,
      });
    }
  }
};

export const shareUserData = (req: Request, res: Response) => {
  req.profile.hashed_password = undefined;
  req.profile.salt = undefined;
  res.json(req.profile);
};

export const authMiddleware = async (
  req: JwtRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("reached auth middleware");
    const user = await userExists("_id", req.auth?._id);
    req.profile = user;
    next();
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({
        msg: error.message,
      });
    }
  }
};

export const validateAdmin = async (
  req: JwtRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await userExists("_id", req.auth?._id);
    if (user.role !== "admin") {
      throw new CustomError("Admin resource. Access denied.", 403);
    }
    next();
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({
        msg: error.message,
      });
    }
  }
};
