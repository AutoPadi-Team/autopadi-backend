const { register, login } = require('../controllers/userController');
const { verifyToken } = require('../middleware/authenticate');
const express = require('express');
const router = express.Router();

router.post('/register', register); // Register a new user
router.post('/login', login); // Login user

module.exports = router;