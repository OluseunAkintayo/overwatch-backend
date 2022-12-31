const yup = require('yup');

const transactionSchema = yup.object({
	customerName: yup.string().required(),
	transactionId: yup.string(),
	transactionDate: yup.string().required(),
	transactionTotal: yup.number().positive().required(),
	products: yup.array().min(1, 'At least one product should be sold').required(),
	user: yup.string()
});

module.exports = transactionSchema;
