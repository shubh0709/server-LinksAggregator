import { Router } from "express";
import { register, registerationToken } from "./controller/auth";
import {registerationValidatorCondns} from "./validators/auth";
import { runValidation } from "./validators";
let router = Router();

router.post("/register", registerationValidatorCondns, runValidation,  register);
router.post("/verify/registerationToken", registerationToken);

export default router;
