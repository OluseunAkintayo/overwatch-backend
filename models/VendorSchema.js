const yup = require('yup');

const vendorSchema = yup.object({
	companyName: yup.string().required('Vendor name is required'),
	companyAddress: yup.string().required('Vendor address is required'),
	contactPerson: yup.string().required('Vendor contact is required'),
	contactEmail: yup.string().required('Password is required'),
	contactPhone: yup.string().required("Vendor phone number is required"),
	isActive: yup.boolean().required(),
	createdAt: yup.string().required('Required'),
	modifiedAt: yup.string().required('Required'),
	markedForDeletion: yup.boolean()
});

module.exports = vendorSchema;
