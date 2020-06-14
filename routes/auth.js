const express = require('express');
const { body } = require('express-validator');

const { getLogin, getSignup, postLogin, postSignup, postLogout, getReset, postReset, getNewPassword, postNewPassword } = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/login', getLogin);
router.get('/signup', getSignup);
router.get('/reset', getReset);
router.get('/reset/:token', getNewPassword);

router.post(
	'/login',
	[
		body('email', 'Please enter a valid email address').isEmail().normalizeEmail(),
		body('password', 'Please enter a valid password').isLength({ min: 8, max: 64 }).trim(),
	],
	postLogin
);
router.post(
	'/signup',
	[
		body('email', 'Please enter a valid email')
			.isEmail()
			.custom(async (value, { req }) => {
				return User.findOne({ email: value }).then((userDoc) => {
					if (userDoc) {
						throw new Error('E-mail already exists, please pick a different one.');
					}
				});
			})
			.normalizeEmail(),
		body('password', 'Please enter a password at least 8 characters in length').isLength({ min: 8, max: 64 }).trim(),
		body('confirmPassword', 'Please make sure passwords match')
			.custom((value, { req }) => value === req.body.password)
			.trim(),
	],
	postSignup
);
router.post('/logout', postLogout);
router.post('/reset', postReset);
router.post('/new-password', postNewPassword);

module.exports = router;
