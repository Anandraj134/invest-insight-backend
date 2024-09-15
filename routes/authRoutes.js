const express = require('express');
const router = express.Router();
const { signUp, signIn, refreshToken } = require('../controllers/authController');

router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/refreshToken', refreshToken);

module.exports = router;
