const yup = require('yup');

const storeSchema = yup.object({
	invoiceNumber: yup.string().required('Invoice number is required'),
	supplyDate: yup.string().required('Supply date is required'),
	products: yup.array().min(1, 'At least one product should be supplied'),
	transactionDate: yup.string().required(),
	transactionId: yup.string().required(),
	transactionType: yup.string().required(),
	userId: yup.string().required(),
	transactionTotal: yup.number().required(),
	other: yup.object({
		vendor: yup.string().required("Vendor is required")
	})
});

module.exports = storeSchema;
