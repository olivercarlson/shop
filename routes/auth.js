const express = require('express');
const { body } = require('express-validator');

const { getLogin, getSignup, postLogin, postSignup, postLogout, getReset, postReset, getNewPassword, postNewPassword } = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/login', getLogin);
router.get('/signup', getSignup);
router.get('/reset', getReset);
router.get('/reset/:token', getNewPassword);

router.post('/login', [body('email').isEmail()], postLogin);
router.post(
	'/signup',
	[
		body('email', 'Please enter a valid email')
			.isEmail()
			.custom((value, { req }) => {
				return User.findOne({ email: value }).then((userDoc) => {
					if (userDoc) {
						return Promise.reject(new Error('E-mail already exists, please pick a different one.'));
					}
				});
			}),
		body('password', 'Please enter a password at least 8 characters in length').isLength({ min: 5, max: 64 }),
		body('confirmPassword').custom((value, { req }) => {
			if (!value === req.body.password) {
				throw new Error('Passwords have to match!');
			}
			return true;
		}),
	],
	postSignup
);
router.post('/logout', postLogout);
router.post('/reset', postReset);
router.post('/new-password', postNewPassword);

module.exports = router;
