exports.getLogin = (req, res) => {
	res.render('auth/login', {
		pageTitle: 'Login',
		path: '/login',
		isLoggedIn: false,
	});
};

exports.postLogin = (req, res) => {
	req.session.isLoggedIn = true;
	res.redirect('/');
};
