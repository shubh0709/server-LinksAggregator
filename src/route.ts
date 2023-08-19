import { Router } from "express";
import { register } from "./controller/auth";
import {registerationValidatorCondns} from "./validators/auth";
import { runValidation } from "./validators";
let router = Router();

router.post("/register", registerationValidatorCondns, runValidation,  register);

export default router;
