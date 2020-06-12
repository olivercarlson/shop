const { randomBytes } = require('crypto');

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator');

const User = require('../models/user');
const { SENDGRID_API_KEY } = require('../priv');

const transporter = nodemailer.createTransport(
	sendgridTransport({
		auth: {
			api_key: SENDGRID_API_KEY,
		},
	})
);

exports.getLogin = (req, res) => {
	let message = req.flash('error');
	if (message.length > 0) {
		[message] = message;
	} else {
		message = null;
	}

	res.render('auth/login', {
		pageTitle: 'Login',
		path: '/login',
		errorMessage: message,
	});
};

exports.getSignup = (req, res) => {
	let message = req.flash('error');
	if (message.length > 0) {
		[message] = message;
	} else {
		message = null;
	}
	res.render('auth/signup', {
		path: '/signup',
		pageTitle: 'Sign Up',
		errorMessage: message,
	});
};

exports.postLogin = (req, res) => {
	const { email, password } = req.body;
	User.findOne({ email }).then((user) => {
		if (!user) {
			req.flash('error', 'Invalid email or password.');
			return res.redirect('/login');
		}
		return bcrypt
			.compare(password, user.password)
			.then((passwordMatch) => {
				if (passwordMatch) {
					req.session.user = user;
					req.session.isLoggedIn = true;
					return req.session.save((err) => {
						console.log(err);
						res.redirect('/');
					});
				}
			})
			.catch((err) => {
				console.log(err);
			});
	});
};

exports.postSignup = (req, res) => {
	const { email, password } = req.body;
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).render('auth/signup', {
			path: '/signup',
			pageTitle: 'Signup',
			errorMessage: errors.array()[0].msg,
		});
	}
	return bcrypt
		.hash(password, 12)
		.then((hashedPassword) => {
			const user = new User({ email, password: hashedPassword, cart: { items: [] } });
			return user.save();
		})
		.then(() => {
			res.redirect('/login');
			return transporter.sendMail({
				to: email,
				from: 'simplenodeshop@gmail.com',
				subject: 'Signup suceeded!',
				html: '<h1> You successfully signed up!</h1>',
			});
		})
		.catch((err) => console.log(err));
};

exports.postLogout = (req, res) => {
	req.session.destroy(() => {
		res.redirect('/');
	});
};

exports.getReset = (req, res) => {
	let message = req.flash('error');
	if (message.length > 0) {
		[message] = message;
	} else {
		message = null;
	}

	res.render('auth/reset', {
		path: '/reset',
		pageTitle: 'Reset Password',
		errorMessage: message,
	});
};

exports.postReset = (req, res, next) => {
	randomBytes(32, (err, buffer) => {
		if (err) {
			console.log(err);
			return res.redirect('/reset');
		}
		const token = buffer.toString('hex');
		User.findOne({ email: req.body.email })
			.then((user) => {
				if (!user) {
					req.flash('error', 'No account with that email found');
					return res.redirect('/reset');
				}
				user.resetToken = token;
				// expire token after one hour.
				user.resetTokenExpiration = Date.now() + 3600000;
				return user.save().then((result) => {
					res.redirect('/');
					transporter.sendMail({
						to: req.body.email,
						from: 'simplenodeshop@gmail.com',
						subject: 'Your Password Reset Request',
						html: `<h1>Your requested password reset</h1>
						<p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password. `,
					});
				});
			})
			.catch((err) => console.log(err));
	});
};

exports.getNewPassword = (req, res, next) => {
	const { token } = req.params;
	User.findOne({ resetToken: req.params.token, resetTokenExpiration: { $gt: Date.now() } })
		.then((user) => {
			let message = req.flash('error');
			if (message.length > 0) {
				[message] = message;
			} else {
				message = null;
			}
			res.render('auth/new-password', {
				path: '/new-password',
				pageTitle: 'New Password',
				errorMessage: message,
				userId: user._id.toString(),
				passwordToken: token,
			});
		})
		.catch((err) => console.log(err));
};

exports.postNewPassword = (req, res, next) => {
	// extract new password
	// find userId in DB
	// update the userId password in the db.
	// return user to login page.
	const { userId, passwordToken } = req.body;
	const newPassword = req.body.password;
	let resetUser;

	User.findOne({ resetToken: passwordToken, resetTokenExpiration: { $gt: Date.now() }, _id: userId })
		.then((user) => {
			resetUser = user;
			return bcrypt.hash(newPassword, 12);
		})
		.then((hashedPassword) => {
			resetUser.password = hashedPassword;
			resetUser.resetToken = undefined;
			resetUser.resetTokenExpiration = undefined;
			return resetUser.save();
		})
		.then((result) => {
			res.redirect('/login');
		})
		.catch((err) => console.log(err));
};
