import { categoryModel } from "../models/category";
import slugify from "slugify";
import { uuid } from "uuidv4";
import aws, { S3 } from "aws-sdk";
import { Buffer } from "buffer";
import fs from "fs";
import { Request as JwtRequest } from "express-jwt";
import { Response } from "express";
import { CustomError } from "../utils/errors";
import { withLogging } from "../middlewares/logger";

const s3: S3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_S3_REGION,
});

export const create = async (req: JwtRequest, res: Response) => {
  const { name, image, content } = req.body;
  const slug = slugify(name);
  // image data
  const base64Data: Buffer = Buffer.from(
    image.replace(/^data:image\/\w+;base64,/, ""),
    "base64"
  );

  const type = image.split(";")[0].split("/")[1];
  let category = new categoryModel({ name, content, slug });

  const params = {
    Bucket: "link-aggregator",
    Key: `category/${uuid()}.${type}`,
    Body: base64Data,
    // ACL: "public-read",
    ContentEncoding: "base64",
    ContentType: `image/${type}`,
  };

  try {
    const data = await new Promise<S3.ManagedUpload.SendData>(
      (resolve, reject) => {
        s3.upload(params, (err: Error, data: S3.ManagedUpload.SendData) => {
          if (err) {
            console.log(err);
            reject(new CustomError("Upload to s3 failed", 400, err));
          }
          resolve(data);
        });
      }
    );

    console.log("AWS UPLOAD RES DATA", JSON.stringify(data));
    category.image.url = data.Location;
    category.image.key = data.Key;
    category.postedBy = req.auth?._id;

    try {
      await category.save();
      console.log("registration success");
      return res.json({
        message: "success",
      });
    } catch (error) {
      throw new CustomError(`Duplicate category`, 400, error);
    }
  } catch (err) {
    console.log(err);
    if (err instanceof CustomError)
      return res.status(err.statusCode).json({ error: err.message });

    res.status(400).json({ error: "Upload to s3 failed" });
  }
};

export const list = async (req: JwtRequest, res: Response) => {
  try {
    const categories = await categoryModel.find({}).sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    console.log(error);
    res.status(400).send("Category list failed");
  }
};

export const read = async (req: JwtRequest, res: Response) => {};

export const remove = async (req: JwtRequest, res: Response) => {};
