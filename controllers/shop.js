const Product = require('../models/product');
const Order = require('../models/order');

exports.getIndex = (req, res) => {
	Product.find()
		.then((products) => {
			res.render('shop/index', {
				prods: products,
				pageTitle: 'Shop',
				path: '/',
			});
		})
		.catch((err) => {
			console.log(err);
		});
};

exports.getProducts = (req, res) => {
	Product.find()
		.then((products) => {
			res.render('shop/product-list', {
				prods: products,
				pageTitle: 'All Products',
				path: '/products',
			});
		})
		.catch((err) => {
			console.log(err);
		});
};

exports.getProduct = (req, res) => {
	const prodId = req.params.productId;
	Product.findById(prodId)
		.then((product) => {
			res.render('shop/product-detail', {
				product,
				pageTitle: product.title,
				path: '/products',
			});
		})
		.catch((err) => console.log(err));
};

exports.getCart = (req, res) => {
	req.user
		.populate('cart.items.productId')
		.execPopulate()
		.then((user) => {
			res.render('shop/cart', {
				path: '/cart',
				pageTitle: 'Your Cart',
				products: user.cart.items,
			});
		})
		.catch((err) => console.log(err));
};

exports.postCart = (req, res) => {
	const prodId = req.body.productId;
	Product.findById(prodId)
		.then((product) => {
			return req.user.addToCart(product);
		})
		.then((result) => {
			res.redirect('/cart');
		});
};

exports.postCartDeleteProduct = (req, res) => {
	const prodId = req.body.productId;
	req.user
		.removeFromCart(prodId)
		.then((result) => {
			res.redirect('/cart');
		})
		.catch((err) => console.log(err));
};

exports.postOrder = (req, res) => {
	req.user
		.populate('cart.items.productId')
		.execPopulate()
		.then((user) => {
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
			return order.save();
		})
		.then(() => {
			return req.user.clearCart();
		})
		.then(() => {
			res.redirect('/orders');
		})
		.catch((err) => console.log(err));
};

exports.getOrders = (req, res) => {
	Order.find({ 'user.userId': req.user._id })
		.then((orders) => {
			res.render('shop/orders', {
				path: '/orders',
				pageTitle: 'Your Orders',
				orders,
			});
		})
		.catch((err) => console.log(err));
};
