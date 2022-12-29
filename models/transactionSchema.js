const yup = require('yup');

const transactionSchema = yup.object({
	customerName: yup.string().required(),
	transactionId: yup.string().required(),
	transactionDate: yup.string().required(),
	products: yup.array().min(1, 'At least one product should be sold').required(),
	user: yup.string().required()
});

module.exports = transactionSchema;
