const router = require('express').Router();
const storeSchema = require('../models/StoreSchema');
const db = require('../connect/connect');
const { ObjectId } = require('mongodb');
const { checkTokenAdmin } = require('./checkToken');

const validate = schema => async(req, res, next) => {
	try {
		await schema.validate(req.body);
		return next();
	} catch (error) {
		res.status(400).json({ status: 0, type: error.name, message: error.message });
	}
}

router.post("/new-supply", validate(storeSchema), checkTokenAdmin, async (req, res) => {
	const { body: supply, user: userId } = req;
	const user = await db.getDb().collection("users").findOne({ _id: ObjectId(userId.id) });
	const { products, transactionType, transactionId, transactionDate, vendor, transactionTotal, userId: user_id, other } = supply;
	try {
		products.forEach(async (item) => {
			const product = await db.getDb().collection("products").findOne({ _id: ObjectId(item.productId) });
			await db.getDb().collection("products").updateOne(
				{ _id: ObjectId(product._id) },
				{
					$set: {
						quantity: product.quantity ? product.quantity + item.quantity : item.quantity,
						pricing: { cost: Number(item.cost), retail: Number(product.pricing.retail) },
						expiryDate: new Date(product.expiryDate).toISOString(),
						inStock: true,
						modifiedAt: new Date().toISOString()
					}
				}
			);
			const { passcode, designation, isActive, createdAt, modifiedAt, ...userProps } = user;
			await db.getDb().collection("productReport").insertOne({ ...item, transactionId, transactionDate, transactionType, vendor: other.vendor , customer: '', user: userProps });
		});
		await db.getDb().collection("transactions").insertOne({ userId: user_id, user: user.firstName + " " + user.lastName, transactionId, transactionDate, products, transactionType, transactionTotal, other }, (err, result) => {
			err ? res.status(500).json({ status: 0, message: "Server error", data: err })
			: res.status(201).json({ status: 1, message: "New supply completed!", data: result });
		});
		// await db.getDb().collection("supplies").insertOne(supply, (err, result) => {
		// 	err ? res.status(500).json({ status: 0, message: "Server error", data: err })
		// 	: res.status(201).json({ status: 1, message: "New supply completed!", data: result });
		// })
	} catch (error) {
		res.status(500).json({ status: 0, data: error });
	}
});

module.exports = router;
