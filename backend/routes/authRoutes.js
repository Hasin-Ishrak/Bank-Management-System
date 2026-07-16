const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/register", authController.register);
router.post("/login", authController.login);

router.get("/me", verifyToken, authController.getProfile);

router.put("/reset-password", verifyToken, authController.resetPassword);

module.exports = router;