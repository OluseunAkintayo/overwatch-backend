const yup = require('yup');

const userSchema = yup.object({
	firstName: yup.string().required('First name is required'),
	lastName: yup.string().required('Last name is required'),
	email: yup.string().email().required('Last name is required'),
	username: yup.string().required('Username is required'),
	designation: yup.array().of(yup.string()).min(1, 'At least one role should be assigned'),
	passcode: yup.string().required('Password is required'),
	isActive: yup.boolean(),
	createdAt: yup.string().required('Required'),
	modifiedAt: yup.string().required('Required'),
	markedForDeletion: yup.boolean()
});

module.exports = userSchema;
