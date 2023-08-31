import { Request, Response, NextFunction } from "express";
import { Request as JwtRequest } from "express-jwt";
import { linkModel, linkSchema } from "../models/links";
import { categoryModel } from "../models/category";

export const createLink = async function (
  req: JwtRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { title, url, categories, type, medium } = req.body;

    const data = new linkModel({
      title,
      slug: title,
      url,
      categories,
      type,
      medium,
      postedBy: req.auth?.id,
    });

    await data.save();
    console.log("link created succesfully");

    res.json({ msg: "success" });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: "link creation failed",
    });
  }
};

export const listAllLinks = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await linkModel.find({});
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: "Listing links failed",
    });
  }
};

export const listLinksOfCategory = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { slug } = req.params;
    const category = await categoryModel.findOne({ slug });
    console.log({ category });
    const data = await linkModel.find({ categories: category });
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: "Listing links failed",
    });
  }
};

export const listUserPostedLinks = async function (
  req: JwtRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.auth?.id;
    const data = await linkModel.find({ postedBy: userId });
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: "Listing links failed",
    });
  }
};

export const readLink = async function (
  req: JwtRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const data = await linkModel.findOne({ _id: id });
    res.json(data);
  } catch (error) {
    return res.status(400).json({
      error: "Error finding link",
    });
  }
};

export const updateLink = async function (
  req: JwtRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const { title, url, categories, type, medium } = req.body;

    await linkModel.findByIdAndUpdate(
      { _id: id },
      { title, url, categories, type, medium }
    );

    // await data.save();
    console.log("link updation succesfully");

    res.json({ msg: "success" });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: "link updation failed",
    });
  }
};

export const removeLink = async function (
  req: JwtRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.body;
    await linkModel.findByIdAndRemove({ _id: id });

    console.log("link deleted succesfully");
    res.json({ msg: "success" });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: "link deletion failed",
    });
  }
};
