const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

// All profile/account routes require a valid logged-in session
router.use(verifyToken);

// Create account (Restricted to Bank Administrators and Employees)
router.post('/create', authorizeRoles('Admin', 'Employee'), accountController.createAccount);

// Get current logged-in customer's profile details or pass specific target user via parameters
router.get('/profile', accountController.getAccountDetails);
router.get('/profile/:userId', authorizeRoles('Admin', 'Employee'), accountController.getAccountDetails);

// Deactivate an account (Admin only control)
router.put('/deactivate/:accountNumber', authorizeRoles('Admin'), accountController.deactivateAccount);

module.exports = router;