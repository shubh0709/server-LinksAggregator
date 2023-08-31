import { check } from "express-validator";

export const linkCreateValidatorCondns = [
  check("title").notEmpty().escape().withMessage("Please provide title"),
  check("url").notEmpty().withMessage("Please provides a URL"),
  check("type")
    .notEmpty()
    .escape()
    .withMessage("Please provide type free or paid"),
  check("medium").notEmpty().escape().withMessage("Please provide medium"),
];
