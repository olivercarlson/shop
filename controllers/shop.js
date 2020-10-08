const Product = require('../models/product');
const Order = require('../models/order');

exports.getIndex = async (req, res, next) => {
	try {
		const products = await Product.find();
		return res.render('shop/index', {
			prods: products,
			pageTitle: 'Shop',
			path: '/',
		});
	} catch (err) {
		const error = new Error(err);
		error.httpStatusCode = 500;
		return next(error);
	}
};

exports.getProducts = async (req, res, next) => {
	try {
		const products = await Product.find();
		return res.render('shop/product-list', {
			prods: products,
			pageTitle: 'All Products',
			path: '/products',
		});
	} catch (err) {
		const error = new Error(err);
		error.httpStatusCode = 500;
		return next(error);
	}
};

exports.getProduct = async (req, res, next) => {
	const prodId = req.params.productId;
	try {
		const product = await Product.findById(prodId);
		return res.render('shop/product-detail', {
			product,
			pageTitle: product.title,
			path: '/products',
		});
	} catch (err) {
		const error = new Error(err);
		error.httpStatusCode = 500;
		return next(error);
	}
};

exports.getCart = async (req, res, next) => {
	try {
		const user = await req.user.populate('cart.items.productId').execPopulate();
		return res.render('shop/cart', {
			path: '/cart',
			pageTitle: 'Your Cart',
			products: user.cart.items,
		});
	} catch (err) {
		const error = new Error(err);
		error.httpStatusCode = 500;
		return next(error);
	}
};

exports.postCart = async (req, res, next) => {
	const prodId = req.body.productId;
	try {
		const product = await Product.findById(prodId);
		await req.user.addToCart(product);
		return res.redirect('/cart');
	} catch (err) {
		// TODO: add error handling here to flash users adding to cart failed.
		const error = new Error(err);
		error.httpStatusCode = 500;
		return next(error);
	}
};

exports.postCartDeleteProduct = async (req, res, next) => {
	const prodId = req.body.productId;
	try {
		await req.user.removeFromCart(prodId);
		return res.redirect('/cart');
	} catch (err) {
		const error = new Error(err);
		error.httpStatusCode = 500;
		return next(error);
	}
};

exports.postOrder = async (req, res, next) => {
	try {
		const user = await req.user.populate('cart.items.productId').execPopulate();

		const products = user.cart.items.map((i) => {
			return { quantity: i.quantity, product: { ...i.productId._doc } };
		});

		const order = new Order({
			user: {
				email: req.user.email,
				userId: req.user._id,
			},
			products,
		});

		await order.save();
		await req.user.clearCart();
		return res.redirect('/orders');
	} catch (err) {
		const error = new Error(err);
		error.httpStatusCode = 500;
		return next(error);
	}
};

exports.getOrders = async (req, res, next) => {
	try {
		const orders = await Order.find({ 'user.userId': req.user._id });
		return res.render('shop/orders', {
			path: '/orders',
			pageTitle: 'Your Orders',
			orders,
		});
	} catch (err) {
		const error = new Error(err);
		error.httpStatusCode = 500;
		return next(error);
	}
};
