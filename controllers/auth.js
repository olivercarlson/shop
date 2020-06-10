exports.getLogin = (req, res) => {
	res.render('auth/login', {
		pageTitle: 'Login',
		path: '/login',
		isLoggedIn: false,
	});
};

exports.postLogin = (req, res) => {
	req.session.isLoggedIn = true;
	req.session.user = {
		test: '123',
		hi: '456',
	};
	console.log(req.session);
	res.redirect('/');
};
