import { Router } from "express";
import { register } from "./controller/auth";
let router = Router();

router.get("/register", register);

export default router;
