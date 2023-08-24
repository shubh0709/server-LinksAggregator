import { Router } from "express";
import {
  authMiddleware,
  login,
  register,
  registerationToken,
  shareUserData,
  validateAdmin,
  validateSignIn,
} from "./controller/auth";
import {
  registerationValidatorCondns,
  loginValidatorCondns,
} from "./validators/auth";
import { runValidation } from "./validators";
let router = Router();

router.post("/register", registerationValidatorCondns, runValidation, register);
router.post("/login", loginValidatorCondns, runValidation, login);
router.post("/verify/registerationToken", registerationToken);

router.post("/admin", validateSignIn, validateAdmin, shareUserData);
router.post("/subscriber", validateSignIn, authMiddleware, shareUserData);

export default router;
