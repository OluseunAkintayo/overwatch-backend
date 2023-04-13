const router = require('express').Router();
const userSchema = require('../models/UserSchema');
const db = require("../connect/connect");
const CryptoJS = require('crypto-js');
const { check, checkTokenAdmin } = require('./checkToken');
const { ObjectId } = require('mongodb');

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

router.get("/profile", check, async (req, res) => {
	const { id } = req.user;
	try {
		const user = await db.getDb().collection("users").findOne({ _id: ObjectId(id) });
		const { id: userId, passcode, createdAt, modifiedAt, ...userProps } = user;
		res.status(200).json({ status: 1, data: userProps });
	} catch (error) {
		res.status(500).json({ status: 0, message: "Error retrieving user", data: JSON.stringify(error) });
	}
})

// get all users - lite
router.get("/lite", checkTokenAdmin, async (req, res) => {
	try {
		const users = await db.getDb().collection("users").find().toArray();
		let newUsers = users.map(item => {
			const { _id, firstName, lastName } = item;
			return { _id, name: firstName + " " + lastName };
		});
		res.status(200).json({ status: 1, data: newUsers });
	} catch (error) {
		res.status(500).json({ status: 0, message: "Error retrieving users", data: JSON.stringify(error) });
	}
})

module.exports = router;
