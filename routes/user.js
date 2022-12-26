const router = require('express').Router();
const userSchema = require('../models/UserSchema');
const db = require("../connect/connect");
const CryptoJS = require('crypto-js');

const { ENCRYPTION_KEY } = process.env;

const validate = (schema) => async(req, res, next) => {
	try {
		await schema.validate(req.body);
		return next();
	} catch (error) {
		res.status(400).json({ status: 0, type: error.name, message: error.message });
	}
}

router.post("/register", validate(userSchema), async (req, res) => {
	const { body } = req;
	const hashedPassword = CryptoJS.AES.encrypt(body.passcode, ENCRYPTION_KEY).toString();
	const duplicateUser = await db.getDb().collection("users").find({ username: req.body.username.trim() }).toArray();
	try {
		if(duplicateUser?.length > 0) {
			const { username } = duplicateUser[0];
			res.status(403).json({ status: 0, message: 'Duplicate usernames not allowed', data: `Profile with the username ${username} already exists.` });
		} else if(duplicateUser.length === 0) {
			const user = {
				...body,
				passcode: hashedPassword,
			}
			await db.getDb().collection("users").insertOne(user, (err, result) => {
				err ? res.status(500).json({ status: 0, message: "Error creating new user", data: err })
				: res.status(201).json({ status: 1, message: "User created successfully", data: result });
			});
		}
	} catch (error) {
		res.status(500).json({ status: 0, message: "A fatal error has ocurred", data: error });
	}
});

module.exports = router;
