import express from "express";
import { check } from "express-validator";
import { searchUser } from "../controllers/searchController.js";
import { validateRequest } from "../middleware/validateRequestMiddleware.js";

const router = express.Router();

router.get(
  "/results",
  check("query").isString().withMessage("Query must be a string"),
  check("limit")
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be an integer between 1 and 100"),
  check("page").isInt({ min: 1 }).withMessage("Page must be an integer greater than or equal to 1"),
  validateRequest,
  searchUser
);

export default router;
