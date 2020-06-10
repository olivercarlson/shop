const Product = require('../models/product');

exports.getAddProduct = (req, res) => {
	res.render('admin/edit-product', {
		pageTitle: 'Add Product',
		path: '/admin/add-product',
		editing: false,
		isLoggedIn: req.isLoggedIn,
	});
};

exports.postAddProduct = (req, res) => {
	const { title, price, description, imageUrl } = req.body;
	const product = new Product({ title, price, description, imageUrl, userId: req.user });
	product
		.save()
		.then((result) => {
			console.log('Created Product');
			res.redirect('/admin/products');
		})
		.catch((err) => console.log(err));
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
			res.render('admin/edit-product', {
				pageTitle: 'Edit Product',
				path: '/admin/edit-product',
				editing: editMode,
				product,
				isLoggedIn: req.isLoggedIn,
			});
		})
		.catch((err) => console.log(err));
};

exports.postEditProduct = (req, res) => {
	const prodId = req.body.productId;
	const updatedTitle = req.body.title;
	const updatedPrice = req.body.price;
	const updatedImageUrl = req.body.imageUrl;
	const updatedDesc = req.body.description;

	Product.findById(prodId)
		.then((product) => {
			product.title = updatedTitle;
			product.price = updatedPrice;
			product.description = updatedDesc;
			product.imageUrl = updatedImageUrl;
			return product.save();
		})
		.then((result) => {
			console.log('UPDATED PRODUCT!');
			res.redirect('/admin/products');
		})
		.catch((err) => console.log(err));
};

exports.getProducts = (req, res) => {
	Product.find()
		.then((products) => {
			res.render('admin/products', {
				prods: products,
				pageTitle: 'Admin Products',
				path: '/admin/products',
				isLoggedIn: req.isLoggedIn,
			});
		})
		.catch((err) => console.log(err));
};

exports.postDeleteProduct = (req, res) => {
	const prodId = req.body.productId;
	Product.findByIdAndRemove(prodId)
		.then(() => {
			res.redirect('/admin/products');
		})
		.catch((err) => console.log(err));
};
