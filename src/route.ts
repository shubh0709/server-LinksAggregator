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
import {
  categoryCreateValidatorCondns,
  categoryUpdateValidatorCondns,
} from "./validators/category";
import { create } from "./controller/category";
import { runValidation } from "./validators";
import slugify from "slugify";

let router = Router();

router.post("/register", registerationValidatorCondns, runValidation, register);
router.post("/login", loginValidatorCondns, runValidation, login);
router.post("/verify/registerationToken", registerationToken);

router.post("/admin", validateSignIn, validateAdmin, shareUserData);
router.post("/subscriber", validateSignIn, authMiddleware, shareUserData);

// category
router.post(
  "/category",
  categoryCreateValidatorCondns,
  runValidation,
  validateSignIn,
  validateAdmin,
  create
);
// router.get("/categories", list);
// router.get("/category/:slug", read);
// router.put(
//   "/category/:slug",
//   categoryUpdateValidatorCondns,
//   runValidation,
//   validateSignIn,
//   validateAdmin,
//   create
// );
// router.delete("/category/:slug", validateSignIn, validateAdmin, remove);

export default router;
