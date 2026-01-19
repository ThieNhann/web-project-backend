import { Router } from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
    postReview,
    getGameReviews,
    deleteReview,
    getMyReviews
} from "../controllers/reviewController.js";

const router = Router();

router.get('/me', verifyToken, getMyReviews);
router.get('/:gameId', getGameReviews);
router.post('/', verifyToken, postReview);
router.delete('/:id', verifyToken, deleteReview)

export default router;