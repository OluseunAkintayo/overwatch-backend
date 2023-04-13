const yup = require('yup');

const transactionSchema = yup.object({
	customerName: yup.string().trim().required(),
	transactionId: yup.string().trim().required(),
	transactionDate: yup.string().trim().required(),
	transactionTotal: yup.number().positive().required(),
	products: yup.array().min(1, 'At least one product should be included').required(),
	transactionType: yup.string().trim().required()
});

const SaleSchema = yup.object({
	transactionId: yup.string().required(),
	userId: yup.string().required(),
	transactionDate: yup.string().required(),
	amount: yup.number().positive().required(),
	products: yup.array().min(1, 'At least one product should be included').required(),
	transactionType: yup.string().required(),
});

module.exports = transactionSchema;
module.exports = { SaleSchema };
