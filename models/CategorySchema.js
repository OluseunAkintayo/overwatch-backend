const yup = require('yup');

const categorySchema = yup.object({
	name: yup.string().required('Category name is required'),
	description: yup.string().required('Description is required'),
	isActive: yup.boolean().required(),
	createdAt: yup.string().required(),
	modifiedAt: yup.string().required(),
});

const subcategorySchema = yup.object({
	name: yup.string().required('Subcategory name is required'),
	category: yup.string().required('Parent category is required'),
	isActive: yup.boolean().required(),
	createdAt: yup.string().required(),
	modifiedAt: yup.string().required(),
});



module.exports = { categorySchema, subcategorySchema };
