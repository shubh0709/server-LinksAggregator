import { Request, Response } from "express";
import AWS from "aws-sdk";
import { userModel } from "../models/user";
import jwt from "jsonwebtoken";
import { Error } from "mongoose";
import { constructEmailParams } from "../utils/email";
import shortId from "shortid";

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
  jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION!, (error) => {
    if (error) {
      console.log("JWT VERIFY IN ACCOUNT ACTIVATION ERROR", error);
      return res.status(401).json({
        error: "Expired link. Try again",
      });
    }
  });

  console.log("decoding token");

  const { name, email, password } = jwt.decode(token);
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
