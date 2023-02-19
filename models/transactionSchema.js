const yup = require('yup');

const transactionSchema = yup.object({
	customerName: yup.string().trim().required(),
	transactionId: yup.string().trim(),
	transactionDate: yup.string().trim().required(),
	transactionTotal: yup.number().positive().required(),
	products: yup.array().min(1, 'At least one product should be included').required(),
	user: yup.string().trim(),
	transactionType: yup.string().trim().required()
});

module.exports = transactionSchema;
