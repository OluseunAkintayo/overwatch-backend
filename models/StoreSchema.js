const yup = require('yup');

const storeSchema = yup.object({
	vendor: yup.string().required('Vendor is required'),
	invoiceNumber: yup.string().required('Invoice number is required'),
	supplyDate: yup.string().required('Supply date is required'),
	products: yup.array().min(1, 'At least one product should be supplied'),
	createdAt: yup.string().required(),
});

module.exports = storeSchema;
