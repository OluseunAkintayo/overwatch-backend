const router = require('express').Router();
const storeSchema = require('../models/StoreSchema');
const db = require('../connect/connect');
const { ObjectId } = require('mongodb');

const validate = schema => async(req, res, next) => {
	try {
		await schema.validate(req.body);
		return next();
	} catch (error) {
		res.status(400).json({ status: 0, type: error.name, message: error.message });
	}
}

router.post("/new-supply", validate(storeSchema), async (req, res) => {
	const { body: supply } = req;
	try {
		supply.products.forEach(async (item) => {
			const product = await db.getDb().collection("products").findOne({ _id: ObjectId(item._id) });
			await db.getDb().collection("products").updateOne(
				{ _id: ObjectId(product._id) },
				{ 
					$set: { 
						quantity: product.quantity ? product.quantity + item.quantity : item.quantity,
						pricing: { cost: item.pricing.cost, retail: product.pricing.retail },
						expiryDate: product.expiryDate,
						inStock: true,
						modifiedAt: new Date().toISOString()
					}
				}
			)
		});
		await db.getDb().collection("supplies").insertOne(supply, (err, result) => {
			err ? res.status(500).json({ status: 0, message: "Server error", data: err })
			: res.status(201).json({ status: 1, message: "New supply completed!", data: result });
		})
	} catch (error) {
		res.status(500).json({ status: 0, data: error });
	}
});

module.exports = router;
