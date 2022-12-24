const yup = require('yup');

const productSchema = yup.object({
	productCode: yup.number().typeError("Product code must be a number").required('Product code is required'),
	name: yup.string().required('Product name is required'),
	description: yup.string(),
	brand: yup.string().required('Product brand is required'),
	category: yup.string().required('Product category is required'),
	subcategory: yup.string(),
	pricing: yup.object({
		cost: yup.string().required('Product cost is required'),
		retail: yup.string().required('Product price is required'),
	}),
	inStock: yup.boolean().required('Required'),
	isActive: yup.boolean().required(),
	imgUrl: yup.string().url(),
	quantity: yup.number(),
	expiryDate: yup.string().required('Expiration date is required'),
	createdAt: yup.string(),
	modifiedAt: yup.string(),
});

module.exports = productSchema;