const bcrypt = require('bcryptjs');

const User = require('../models/user');

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
	const { email, password, confirmPassword } = req.body;
	User.findOne({ email })
		.then((userDoc) => {
			if (userDoc) {
				req.flash('error', 'E-mail exists already.');
				return res.redirect('/signup');
			}
			return bcrypt
				.hash(password, 12)
				.then((hashedPassword) => {
					const user = new User({ email, password: hashedPassword, cart: { items: [] } });
					return user.save();
				})
				.then((result) => {
					res.redirect('/login');
				});
		})
		.catch((err) => console.log(err));
};

exports.postLogout = (req, res) => {
	req.session.destroy(() => {
		res.redirect('/');
	});
};
