import { Request, Response } from "express";

export const register = (req: Request, res: Response) => {
  return res.json({ mes: "you reached register endpoint" });
};
