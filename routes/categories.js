const router = require('express').Router();
const { ObjectId } = require('mongodb');
const db = require('../connect/connect');
const { categorySchema } = require('../models/CategorySchema');
const { checkTokenAdmin } = require('./checkToken');

// get all brands
router.get("/", checkTokenAdmin, async (req, res) => {
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

router.post("/", validate(categorySchema), async (req, res) => {
	const { body: category } = req;
	const duplicateCategory = await db.getDb().collection("productCategories").findOne({ name: category.name.trim() });
	if(duplicateCategory) {
		res.status(200).json({ status: 0, message: `The category with the name ${duplicateCategory.name} already exists.` });
	} else {
		await db.getDb().collection("productCategories").insertOne(category, (err, result) => {
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
router.put("/deactivate/:id", async (req, res) => {
	const { id } = req.params;
	try {
		const brand = await db.getDb().collection("productCategories").findOne({ _id: ObjectId(id) });
		if(brand) {
			if(!brand.isActive) {
				res.status(200).json({ status: 1, message: "Product category is already inactive", data: [] })
			} else {
				await db.getDb().collection("productCategories").updateOne(
					{ _id: ObjectId(id) },
					{ $set: {
						...req.body,
						isActive: false,
						markedForDeletion: true
					}}
				)
				res.status(200).json({ status: 1, message: "Product category deactivated successfully", data: brand });
			}
		} else {
			res.status(200).json({ status: 0, message: "Product category with the provided ID not found ", data: [] });
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
		const category = await db.getDb().collection("productCategories").findOne({ _id: ObjectId(id) });
		if(category) {
			const deleteItem = await db.getDb().collection("productCategories").deleteOne({ _id: ObjectId(id) });
			res.status(200).json({ status: 1, message: "Product category deleted successfully", data: deleteItem });
		} else {
			res.status(200).json({ status: 0, message: "Product category with the provided ID not found ", data: [] });
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ status: 0, message: "Update operation failed", data: error });
	}
});

module.exports = router;
