import { categoryModel } from "../models/category";
import slugify from "slugify";
import { uuid } from "uuidv4";
import aws, { AWSError, S3 } from "aws-sdk";
import { Buffer } from "buffer";
import fs from "fs";
import { Request as JwtRequest } from "express-jwt";
import { Response } from "express";
import { CustomError } from "../utils/errors";
import { withLogging } from "../middlewares/logger";
import { linkModel } from "../models/links";

const s3: S3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_S3_REGION,
});

export const createCategory = async (req: JwtRequest, res: Response) => {
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
      console.log("category created success");
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

export const listAllCategories = async (req: JwtRequest, res: Response) => {
  try {
    const categories = await categoryModel.find({}).sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    console.log(error);
    res.status(400).send("Category list failed");
  }
};

export const readCategory = async (req: JwtRequest, res: Response) => {
  try {
    const { slug } = req.params;
    const category = await categoryModel.findOne({ slug });

    const data = await linkModel
      .find({ categories: category })
      .sort({ createdAt: -1 });

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: "Cant read category",
    });
  }
};

export const removeCategory = async (req: JwtRequest, res: Response) => {
  try {
    console.log("reached removeCategory");
    const { slug } = req.params;
    await categoryModel.findOneAndRemove({ _id: slug });
    console.log("delete category");
    return res.json({ msg: "success" });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: "category deletion failed",
    });
  }
};

export const updateCategory = async (req: JwtRequest, res: Response) => {
  try {
    const { slug } = req.params;
    const { name, content, image } = req.body;
    let updatedCategoryData;
    const oldData = await categoryModel.findOne({ slug });
    if (oldData) {
      if (image) {
        const base64Data: Buffer = Buffer.from(
          image.replace(/^data:image\/\w+;base64,/, ""),
          "base64"
        );

        const type = image.split(";")[0].split("/")[1];

        // delete existing img
        await new Promise<void>((resolve, reject) => {
          s3.deleteObject(
            { Bucket: "link-aggregator", Key: oldData.image.key },
            (err: AWSError, data: S3.Types.DeleteObjectOutput) => {
              if (err) {
                console.log(err);
                reject(new CustomError("Img deletion in s3 failed", 400, err));
              }
              resolve();
            }
          );
        });

        // uploading new img
        const params = {
          Bucket: "link-aggregator",
          Key: `category/${uuid()}.${type}`,
          Body: base64Data,
          // ACL: "public-read",
          ContentEncoding: "base64",
          ContentType: `image/${type}`,
        };

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
        oldData.image.url = data.Location;
        oldData.image.key = data.Key;
      }

      updatedCategoryData = categoryModel.updateOne(
        { _id: oldData._id },
        { name: oldData.name, content: oldData.content, image: oldData.image },
        { new: true }
      );
    } else {
      throw new CustomError("category not found", 400);
    }
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({
        msg: error.message,
      });
    }
    console.log(error);
    res.status(400).json({
      error: "category deletion failed",
    });
  }
};
