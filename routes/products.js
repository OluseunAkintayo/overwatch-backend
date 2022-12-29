const router = require('express').Router();
const { ObjectId } = require('mongodb');
const db = require("../connect/connect");
const productSchema = require('../models/ProductSchema');
const { checkTokenAdmin } = require('./checkToken');

router.get("/list", async (req, res) => {
	// console.log(res.user);
	try {
		const products = await db.getDb().collection("products").find({}).toArray();
		res.status(200).json({ success: true, data: products });
	} catch (error) {
		res.status(500).json({ success: false, data: error });
	}
});

router.get("/one", async (req, res) => {
	const { id } = req.body;
	try {
		const product = await db.getDb().collection("products").findOne({ _id: ObjectId(id) });
		res.status(200).json({ status: 1, data: product });
	} catch (error) {
		res.status(500).json({ status: 0, data: error });
	}
});

// new product
const validate = (schema) => async(req, res, next) => {
	try {
		await schema.validate(req.body);
		return next();
	} catch (error) {
		res.status(400).json({ status: 0, type: error.name, message: error.message });
	}
}
router.post("/new", validate(productSchema), async (req, res) => {
	const { body: product } = req;
	console.log("Validation completed");
	await db.getDb().collection("products").insertOne(product, (err, result) => {
		err ? res.status(500).json({ status: 0, message: "Error creating new product", data: err })
		: res.status(201).json({ status: 1, message: "Product created successfully", data: result });
	});
});

// update item
router.put("/update/:id", validate(productSchema), async (req, res) => {
	const { id } = req.params;
	try {
		const product = await db.getDb().collection("products").findOne({ _id: ObjectId(id) });
		if(product) {
			const updateItem = await db.getDb().collection("products").updateOne(
				{ _id: ObjectId(id) },
				{ $set: {
					...req.body,
				} }
			)
			res.json({ status: 1, data: updateItem });
		} else {
			res.json({ status: 0, data: "Item with the provided ID not found "});
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ status: 0, message: "Update operation failed", data: error });
	}
});

// deactivate item
router.put("/deactivate", async (req, res) => {
	const { id } = req.body;
	try {
		const product = await db.getDb().collection("products").findOne({ _id: ObjectId(id) });
		if(product) {
			if(product.isActive) {
				res.json({ status: 1, message: "Product is already inactive", data: [] })
			} else {
				await db.getDb().collection("products").updateOne(
					{ _id: ObjectId(id) },
					{ $set: {
						...req.body,
						isActive: false
					} }
				)
				res.json({ status: 1, message: "Product deactivated successfully", data: product });
			}
		} else {
			res.json({ status: 0, message: "Item with the provided ID not found ", data: [] });
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ status: 0, message: "Update operation failed", data: error });
	}
});

module.exports = router;