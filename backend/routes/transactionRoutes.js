const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

// All transactions require standard session login validation
router.use(verifyToken);

// Customer endpoints (or Employees acting on behalf of customers)
router.post('/transfer', authorizeRoles('Customer', 'Employee'), transactionController.transfer);

// Employee manual terminal overrides (Deposits & Withdrawals over the counter)
router.post('/deposit', authorizeRoles('Employee', 'Admin'), transactionController.deposit);
router.post('/withdraw', authorizeRoles('Employee', 'Admin'), transactionController.withdraw);

module.exports = router;