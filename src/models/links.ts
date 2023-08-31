import { Schema, model, Document } from "mongoose";

export interface ILinks extends Document {
  title: string;
  slug: string;
  url: string;
  type: string;
  medium: string;
  postedBy: Schema.Types.ObjectId;
  categories: Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  clicks: Number;
}

export const linkSchema = new Schema<ILinks>(
  {
    title: {
      type: String,
      trim: true,
      required: true,
      max: 256,
    },
    url: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
    },
    type: {
      type: String,
      default: "Free",
      required: true,
    },
    medium: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    categories: [
      {
        type: Schema.ObjectId,
        ref: "Category",
        required: true,
      },
    ],
    postedBy: {
      type: Schema.ObjectId,
      ref: "User",
    },
    clicks: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const linkModel = model<ILinks>("Link", linkSchema);
