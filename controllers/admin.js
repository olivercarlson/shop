const { check, validationResult } = require('express-validator');
const Product = require('../models/product');

exports.getAddProduct = (req, res) => {
	res.render('admin/edit-product', {
		pageTitle: 'Add Product',
		path: '/admin/add-product',
		editing: false,
		hasError: false,
		errorMessage: null,
		validationErrors: [],
	});
};

exports.postAddProduct = (req, res) => {
	const { title, price, description, imageUrl } = req.body;
	const product = new Product({ title, price, description, imageUrl, userId: req.user });
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(422).render('admin/edit-product', {
			pageTitle: 'Add Product',
			path: '/admin/add-product',
			editing: false,
			hasError: true,
			product: {
				title,
				imageUrl,
				price,
				description,
			},
			errorMessage: errors.array()[0].msg,
			validationErrors: errors.array(),
		});
	}

	product
		.save()
		.then((result) => {
			console.log('Created Product');
			res.redirect('/admin/products');
		})
		.catch(() => res.redirect('/500'));
};

exports.getEditProduct = (req, res) => {
	const editMode = req.query.edit;
	if (!editMode) {
		return res.redirect('/');
	}
	const prodId = req.params.productId;
	Product.findById(prodId)
		.then((product) => {
			if (!product) {
				return res.redirect('/');
			}
			return res.render('admin/edit-product', {
				pageTitle: 'Edit Product',
				path: '/admin/edit-product',
				editing: editMode,
				product,
				hasError: false,
				errorMessage: null,
				validationErrors: [],
			});
		})
		.catch((err) => console.log(err));
};

exports.postEditProduct = (req, res) => {
	const prodId = req.body.productId;
	const { title, price, imageUrl, description } = req.body;
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(422).render('admin/edit-product', {
			pageTitle: 'Edit Product',
			path: '/admin/edit-product',
			editing: true,
			hasError: true,
			product: {
				title,
				imageUrl,
				price,
				description,
				_id: prodId,
			},
			errorMessage: errors.array()[0].msg,
			validationErrors: errors.array(),
		});
	}
	Product.findById(prodId)
		.then((product) => {
			if (product.userId.toString() !== req.user._id.toString()) {
				return res.redirect('/');
			}
			product.title = title;
			product.price = price;
			product.description = description;
			product.imageUrl = imageUrl;
			return product.save().then((result) => {
				console.log('UPDATED PRODUCT!');
				res.redirect('/admin/products');
			});
		})
		.catch((err) => console.log(err));
};

exports.getProducts = (req, res) => {
	Product.find({ userId: req.user._id })
		.then((products) => {
			return res.render('admin/products', {
				prods: products,
				pageTitle: 'Admin Products',
				path: '/admin/products',
			});
		})
		.catch((err) => console.log(err));
};

exports.postDeleteProduct = (req, res) => {
	const prodId = req.body.productId;
	Product.deleteOne({ _id: prodId, userId: req.user._id })
		.then(() => {
			return res.redirect('/admin/products');
		})
		.catch((err) => console.log(err));
};
