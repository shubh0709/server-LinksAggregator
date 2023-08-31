import { Schema, model, Document } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  image: {
    url: string;
    key: string;
  };
  content: any; // Change this type to match your actual content structure
  postedBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      max: 32,
    },
    slug: {
      type: String,
      index: true,
      required: true,
      unique: true,
      lowercase: true,
    },
    image: {
      url: String,
      key: String,
    },
    content: {
      type: {},
      min: 20,
      max: 2000000,
    },
    postedBy: {
      type: Schema.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);


export const categoryModel =  model<ICategory>("Category", categorySchema);