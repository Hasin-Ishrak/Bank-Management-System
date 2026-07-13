const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

router.use(verifyToken);

// Customer Loan Application portal
router.post('/loans/apply', authorizeRoles('Customer'), reportController.applyForLoan);

// Admin Loan Approvals panel
router.put('/loans/:loanId/status', authorizeRoles('Admin'), reportController.updateLoanStatus);

// Global Analytical Reporting dashboard dataset (Admins & Employees privilege)
router.get('/dashboard/metrics', authorizeRoles('Admin', 'Employee'), reportController.getSystemReports);

module.exports = router;