import { Router } from "express";
// controller
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
  createCategory,
  listAllCategories,
  readCategory,
  removeCategory,
  updateCategory,
} from "./controller/category";
import {
  createLink,
  listAllLinks,
  listLinksOfCategory,
  listUserPostedLinks,
  readLink,
  removeLink,
  updateLink,
} from "./controller/link";

// validators
import { runValidation } from "./validators";
import {
  registerationValidatorCondns,
  loginValidatorCondns,
} from "./validators/auth";
import {
  categoryCreateValidatorCondns,
  categoryUpdateValidatorCondns,
} from "./validators/category";
import { linkCreateValidatorCondns } from "./validators/link";

let router = Router();

// auth
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
  createCategory
);
router.get("/listCategories", listAllCategories);
router.get("/category/:slug", readCategory);
router.put(
  "/category/:slug",
  categoryUpdateValidatorCondns,
  runValidation,
  validateSignIn,
  validateAdmin,
  updateCategory
);
router.delete("/category/:slug", validateSignIn, validateAdmin, removeCategory);

// link
router.post(
  "/createLink",
  linkCreateValidatorCondns,
  runValidation,
  validateSignIn,
  authMiddleware,
  createLink
);
router.put(
  "/link/:id",
  runValidation,
  validateSignIn,
  authMiddleware,
  updateLink
);
router.delete(
  "/link/:id",
  runValidation,
  validateSignIn,
  authMiddleware,
  removeLink
);
router.get(
  "/link/:id",
  runValidation,
  validateSignIn,
  authMiddleware,
  readLink
);
router.get(
  "/links",
  runValidation,
  validateSignIn,
  authMiddleware,
  listUserPostedLinks
);
router.get(
  "/links/:slug",
  runValidation,
  validateSignIn,
  authMiddleware,
  listLinksOfCategory
);
router.get(
  "/links/all",
  runValidation,
  validateSignIn,
  authMiddleware,
  listAllLinks
);

export default router;
