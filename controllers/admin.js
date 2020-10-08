const { validationResult } = require('express-validator');
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

exports.postAddProduct = async (req, res, next) => {
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

	try {
		await product.save();
		return res.redirect('/admin/products');
	} catch (err) {
		const error = new Error(err);
		error.httpStatusCode = 500;
		return next(error);
	}
};

exports.getEditProduct = async (req, res, next) => {
	const editMode = req.query.edit;
	if (!editMode) {
		return res.redirect('/');
	}
	const prodId = req.params.productId;
	try {
		const product = await Product.findById(prodId);
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
	} catch (err) {
		const error = new Error(err);
		error.httpStatusCode = 500;
		return next(error);
	}
};

exports.postEditProduct = async (req, res, next) => {
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
	try {
		const product = await Product.findById(prodId);
		if (product.userId.toString() !== req.user._id.toString()) {
			return res.redirect('/');
		}
		product.title = title;
		product.price = price;
		product.description = description;
		product.imageUrl = imageUrl;
		return product.save().then(() => {
			res.redirect('/admin/products');
		});
	} catch (err) {
		const error = new Error(err);
		error.httpStatusCode = 500;
		return next(error);
	}
};

exports.getProducts = async (req, res, next) => {
	try {
		const products = await Product.find({ userId: req.user._id });
		return res.render('admin/products', {
			prods: products,
			pageTitle: 'Admin Products',
			path: '/admin/products',
		});
	} catch (err) {
		const error = new Error(err);
		error.httpStatusCode = 500;
		return next(error);
	}
};

exports.postDeleteProduct = async (req, res, next) => {
	const prodId = req.body.productId;
	try {
		await Product.deleteOne({ _id: prodId, userId: req.user._id });
		return res.redirect('/admin/products');
	} catch (err) {
		const error = new Error(err);
		error.httpStatusCode = 500;
		return next(error);
	}
};
