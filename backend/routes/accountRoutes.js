const express = require("express");
const router = express.Router();

const accountController = require("../controllers/accountController");
const {
  verifyToken,
  authorizeRoles,
} = require("../middleware/auth");

// Customer/Admin/Employee
router.get(
  "/me",
  verifyToken,
  accountController.getAccountDetails
);

// Admin/Employee
router.get(
  "/:userId",
  verifyToken,
  authorizeRoles("Admin", "Employee"),
  accountController.getAccountDetails
);

// Admin/Employee
router.post(
  "/",
  verifyToken,
  authorizeRoles("Admin", "Employee"),
  accountController.createAccount
);

// Admin/Employee
router.put(
  "/deactivate/:accountNumber",
  verifyToken,
  authorizeRoles("Admin", "Employee"),
  accountController.deactivateAccount
);

module.exports = router;