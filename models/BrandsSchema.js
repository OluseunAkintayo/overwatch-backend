const yup = require('yup');

const brandSchema = yup.object({
	name: yup.string().required('Brand name is required'),
	manufacturer: yup.string().required('Brand manufacturer is required'),
	isActive: yup.boolean().required(),
	createdAt: yup.string().required(),
	modifiedAt: yup.string().required(),
});

module.exports = brandSchema;