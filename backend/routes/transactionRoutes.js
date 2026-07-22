const express = require("express");
const router = express.Router();

const transactionController = require("../controllers/transactionController");
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware"); // Updated from "auth" to "authMiddleware"

// Customer/Admin/Employee
router.post(
  "/deposit",
  verifyToken,
  transactionController.deposit
);

router.post(
  "/withdraw",
  verifyToken,
  transactionController.withdraw
);

router.post(
  "/transfer",
  verifyToken,
  transactionController.transfer
);

// Customer
router.get(
  "/history",
  verifyToken,
  authorizeRoles("Customer"),
  transactionController.getMyTransactions
);

// Admin / Employee
router.get(
  "/all",
  verifyToken,
  authorizeRoles("Admin", "Employee"),
  transactionController.getAllTransactions
);

module.exports = router;