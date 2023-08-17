import { Router } from "express";
import { register } from "./controller/auth";
let router = Router();

router.get("/auth", register);

export default router;
