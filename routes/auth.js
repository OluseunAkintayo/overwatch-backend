const router = require('express').Router();
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');
const db = require('../connect/connect');
const dayjs = require('dayjs');

const { ENCRYPTION_KEY, TOKEN_KEY } = process.env;

router.post('/login', async(req, res) => {
	const user = await db.getDb().collection("users").findOne({ username: req.body.username });

	try {
		if(user && user.isActive) {
			let password = CryptoJS.AES.decrypt(user.passcode, ENCRYPTION_KEY);
			password = password.toString(CryptoJS.enc.Utf8);
			if(password === req.body.passcode) {
				const { passcode, isActive, createdAt, modifiedAt, id, ...userProps  } = user;
				const token = jwt.sign(
					{
						id: user._id,
						isCashier: user.designation.includes('cashier'),
						isAdmin: user.designation.includes('admin'),
						isSuperAdmin: user.designation.includes('superAdmin')
					},
					TOKEN_KEY,
					{ algorithm: 'HS512' },
					{ expiresIn: '1d' }
				);
				const tokenExpiryDate = dayjs().add(1, 'day');
				res.status(200).json({
					status: 1,
					message: "Login successful",
					user: userProps,
					token: token,
					tokenExpiryDate
				 });
			} else {
				res.status(200).json({ status: 0, message: "Incorrect password", data: {} });
			}
		} else {
			res.status(200).json({ status: 0, message: "Incorrect username.", data: {} });
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ status: 0, message: "Error signing in!", data: error });
	}
});

module.exports = router;
