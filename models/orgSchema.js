const yup = require('yup');

const orgSettingsSchema = yup.object({
	orgName: yup.string().required(),
	phone: yup.string().required(),
	email: yup.string().required(),
	address: yup.string().required(),
	salutation: yup.string().required(),
	disclaimer: yup.string(),
	createdAt: yup.string().required(),
	modifiedAt: yup.string(),
});

module.exports = orgSettingsSchema;
