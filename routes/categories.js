const router = require('express').Router();
const { ObjectId } = require('mongodb');
const db = require('../connect/connect');
const { categorySchema } = require('../models/CategorySchema');

// get all brands
router.get("/list", async (req, res) => {
	try {
		const categories = await db.getDb().collection("productCategories").find().toArray();
		res.status(200).json({ status: 1, message: "Items retrieved successfully", data: categories });
	} catch (error) {
		res.status(500).json({ status: 0, message: "Error retrieving categories from database", data: error });
	}
});

// new brand
const validate = (schema) => async(req, res, next) => {
	try {
		await schema.validate(req.body);
		return next();
	} catch (error) {
		res.status(400).json({ status: 0, type: error.name, message: error.message });
	}
}

router.post("/new", validate(categorySchema), async (req, res) => {
	const { body: brand } = req;
	const duplicateCategory = await db.getDb().collection("productCategories").findOne({ name: brand.name });
	if(duplicateCategory) {
		res.status(200).json({ status: 1, message: `The category with the name ${duplicateCategory.name} already exists.`, data: [] });
	} else {
		await db.getDb().collection("productCategories").insertOne(brand, (err, result) => {
			err ? res.status(500).json({ status: 0, message: "Error creating new category", data: err })
			: res.status(201).json({ status: 1, message: "Product category created successfully", data: result });
		});
	}
});

// modify brand
router.put("/update/:id", validate(categorySchema), async (req, res) => {
	const { id } = req.params;
	try {
		const category = await db.getDb().collection("productCategories").findOne({ _id: ObjectId(id) });
		if(category) {
			await db.getDb().collection("productCategories").updateOne(
				{ _id: ObjectId(id) },
				{ $set: { ...req.body }}
			)
			res.status(200).json({ status: 1, message: "Product category updated successfully", data: req.body });
		} else {
			res.json({ status: 0, data: "Product category with the provided ID not found"});
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ status: 0, message: "Update operation failed", data: error });
	}
});

// deactivate brand
router.put("/deactivate", async (req, res) => {
	const { id } = req.body;
	try {
		const brand = await db.getDb().collection("productCategories").findOne({ _id: ObjectId(id) });
		if(brand) {
			if(brand.isActive) {
				res.status(200).json({ status: 1, message: "Product brand is already inactive", data: [] })
			} else {
				await db.getDb().collection("productCategories").updateOne(
					{ _id: ObjectId(id) },
					{ $set: {
						...req.body,
						isActive: false
					} }
				)
				res.status(200).json({ status: 1, message: "Product brand deactivated successfully", data: brand });
			}
		} else {
			res.status(200).json({ status: 0, message: "Product brand with the provided ID not found ", data: [] });
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ status: 0, message: "Update operation failed", data: error });
	}
});

// delete brand
router.delete("/delete/:id", async (req, res) => {
	const { id } = req.params;
	try {
		const brand = await db.getDb().collection("productCategories").findOne({ _id: ObjectId(id) });
		if(brand) {
			const deleteItem = await db.getDb().collection("productCategories").deleteOne({ _id: ObjectId(id) });
			res.status(200).json({ status: 1, message: "Product brand deleted successfully", data: deleteItem });
		} else {
			res.status(200).json({ status: 0, message: "Product brand with the provided ID not found ", data: [] });
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ status: 0, message: "Update operation failed", data: error });
	}
});

module.exports = router;
