import { userModel } from "../models/user";
import { CustomError } from "./errors";

export const userExists = async (key: string, val: any) => {
  try {
    console.log([val]);
    const user = await userModel.findOne({ [key]: val }).exec();
    if (!user) {
      throw new CustomError(
        "User with that key does not exist. Please register.",
        400
      );
    }

    return user;
  } catch (error) {
    throw new CustomError(
      "An error occurred while checking the email availability",
      500,
      error
    );
  }
};
