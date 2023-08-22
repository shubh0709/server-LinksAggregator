import { Schema, model, Document } from "mongoose";
import crypto from "crypto";

export interface IUser extends Document {
  username: string;
  name: string;
  email: string;
  hashed_password: string;
  salt: string;
  role: string;
  resetPasswordLink: string;
  authenticate(plainText: string): boolean;
  encryptPassword(password: string): string;
  makeSalt(): string;
  password: string; // virtual field
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      trim: true,
      required: true,
      max: 12,
      unique: true,
      index: true,
      lowercase: true,
    },
    name: {
      type: String,
      trim: true,
      required: true,
      max: 32,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      lowercase: true,
    },
    hashed_password: {
      type: String,
      required: true,
    },
    salt: String,
    role: {
      type: String,
      default: "subscriber",
    },
    resetPasswordLink: String,
  },
  { toJSON: { virtuals: true }, timestamps: true }
);

// methods > authenticate, encryptPassword, makeSalt
userSchema.methods = {
  authenticate: function (plainText: string) {
    return this.encryptPassword(plainText) === this.hashed_password;
  },

  encryptPassword: function (password: string) {
    if (!password) return "";
    try {
      return crypto
        .createHmac("sha1", this.salt)
        .update(password)
        .digest("hex");
    } catch (err) {
      return "";
    }
  },

  makeSalt: function () {
    return Math.random().toString(36).slice(2);
  },
};

// virtual fields
userSchema
  .virtual<IUser>("password")
  .get(function (this: IUser & { _password: string }) {
    return this._password;
  })
  .set(function (this: IUser & { _password: string }, password) {
    // create temp variable called _password
    this._password = password;
    // generate salt
    this.salt = this.makeSalt();
    // encrypt password
    this.hashed_password = this.encryptPassword(password);
  });

export const userModel = model<IUser>("User", userSchema);
