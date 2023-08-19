import { query, check } from "express-validator";

export const registerationValidatorCondns = [
  check("name").notEmpty().escape().withMessage("Please provide name"),
  check("email").isEmail().escape().withMessage("Must be a valid email"),
  check("password")
    .isLength({ min: 6 })
    .escape()
    .withMessage("Password should be atleast 6 characters long"),
];
