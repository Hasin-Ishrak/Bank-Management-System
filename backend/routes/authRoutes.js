const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Open routes (No auth required to create accounts or log in)
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;