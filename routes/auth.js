const router = require('express').Router();
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');
const db = require('../connect/connect');

const { ENCRYPTION_KEY, TOKEN_KEY } = process.env;

router.post('/login', async(req, res) => {
	const user = await db.getDb().collection("users").findOne({ username: req.body.username });
	// const user = await db.getDb().collection("users").findOne({
	// 	$or: [
	// 		{ "email": {$regex: `${req.body.email}`, $options: "i"} },
	// 		{ "username": {$regex: `${req.body.username}`, $options: "i"} },
	// 	]
	// });
	try {
		if(user && user.isActive) {
			let password = CryptoJS.AES.decrypt(user.passcode, ENCRYPTION_KEY);
			password = password.toString(CryptoJS.enc.Utf8);
			if(password === req.body.passcode) {
				const { passcode, isActive, createdAt, modifiedAt, id, ...userProps  } = user;
				const token = jwt.sign(
					{ id: user._id, isAdmin: user.designation.includes('Admin') },
					TOKEN_KEY,
					{ algorithm: 'HS512' },
					{ expiresIn: '1d' }
				);
				const now = new Date();
				const tokenExpiryDate = new Date(now.setTime(now.getTime() + 24 * 3600000));
				const tokenExpiryDateString = tokenExpiryDate.toDateString() + " " + tokenExpiryDate.toLocaleTimeString();
				res.json({
					status: 1,
					message: "Login successful",
					user: userProps,
					token: token,
					expiresIn: tokenExpiryDateString
				 });
			} else {
				res.json({ status: 0, message: "Incorrect password provided" });
			}
		} else {
			res.json({ status: 0, message: "User not found" });
		}
	} catch (error) {
		res.json({ status: 0, message: "Error creating user", data: error });
	}
});


module.exports = router;