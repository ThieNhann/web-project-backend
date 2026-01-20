import express from "express";
import { validateRequest } from "../middleware/validateRequestMiddleware.js";
import adminController from "../controllers/adminController.js";

const router = express.Router();

// "{{baseURL}}/api/admin"

// -- GAME MANAGEMENT ROUTES --
router.get("/game-management/available-games", adminController.getAvailableGames);
// router.get("/game-management/game-details/:gameId", adminController.getGameDetails);
router.post("/game-management/activate-game-mode/:gameId", adminController.activateGameMode);
router.post("/game-management/deactivate-game-mode/:gameId", adminController.deactivateGameMode);
router.put("/game-management/update-board-size/:gameId", adminController.updateBoardSize);
router.put("/game-management/update-timer/:gameId", adminController.updateTimer);

// -- STATISTICS ROUTES --
router.get("/statistics/24hour-players", adminController.get24HourPlayers);
router.get("/statistics/24hour-games", adminController.get24HourGames);
router.get("/statistics/24hour-server-load", adminController.get24HourServerLoad);
router.get(
  "/statistics/monthly-game-type-percentage",
  adminController.getMonthlyGameTypePercentage,
);
router.get("/statistics/yearly-players", adminController.getYearlyPlayers);

// -- USER MANAGEMENT ROUTES --
router.get("/user-management", adminController.getUsers);
router.get("/user-management/search", adminController.searchUsers);
router.post("/user-management/activate", adminController.activateUser);
router.post("/user-management/deactivate", adminController.deactivateUser);

export default router;
