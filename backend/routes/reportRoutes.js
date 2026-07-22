const express = require("express");
const router = express.Router();

const reportController = require("../controllers/reportController");
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware"); // Updated from "auth" to "authMiddleware"

// Customer
router.post(
  "/loan",
  verifyToken,
  authorizeRoles("Customer"),
  reportController.applyForLoan
);

router.get(
  "/loan/me",
  verifyToken,
  authorizeRoles("Customer"),
  reportController.getMyLoans
);

// Admin / Employee
router.get(
  "/loan",
  verifyToken,
  authorizeRoles("Admin", "Employee"),
  reportController.getAllLoans
);

router.put(
  "/loan/:loanId",
  verifyToken,
  authorizeRoles("Admin", "Employee"),
  reportController.updateLoanStatus
);

router.get(
  "/system",
  verifyToken,
  authorizeRoles("Admin", "Employee"),
  reportController.getSystemReports
);

module.exports = router;