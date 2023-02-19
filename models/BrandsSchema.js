const yup = require('yup');

const brandSchema = yup.object({
	name: yup.string().required(),
	manufacturer: yup.string().required(),
	isActive: yup.boolean().required(),
	createdAt: yup.string().required(),
	modifiedAt: yup.string().required(),
});

module.exports = brandSchema;