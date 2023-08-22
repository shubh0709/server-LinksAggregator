import { Router } from "express";
import { login, register, registerationToken } from "./controller/auth";
import {registerationValidatorCondns, loginValidatorCondns} from "./validators/auth";
import { runValidation } from "./validators";
let router = Router();

router.post("/register", registerationValidatorCondns, runValidation,  register);
router.post("/login", loginValidatorCondns, runValidation,  login);
router.post("/verify/registerationToken", registerationToken);

export default router;
