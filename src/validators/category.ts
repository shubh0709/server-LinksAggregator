import { check } from "express-validator";

export const categoryCreateValidatorCondns = [
  check("name").notEmpty().escape().withMessage("Please provide name"),
  check("image").notEmpty().withMessage("Please prvide image"),
  check("content")
    .escape()
    .isLength({ min: 20 })
    .withMessage("Content should be atleast 20 characters long"),
];

export const categoryUpdateValidatorCondns = [
  check("name").notEmpty().escape().withMessage("Please provide name"),
  check("content")
    .escape()
    .isLength({ min: 20 })
    .withMessage("Content should be atleast 20 characters long"),
];
