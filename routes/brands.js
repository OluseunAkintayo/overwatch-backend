const router = require('express').Router();
const { ObjectId } = require('mongodb');
const db = require('../connect/connect');
const brandSchema = require('../models/BrandsSchema');
const { checkTokenAdmin } = require('./checkToken');

// get all brands
router.get("/", checkTokenAdmin, async (req, res) => {
	try {
		const brands = await db.getDb().collection("productBrands").find().toArray();
		res.status(200).json({ status: 1, message: "Brands retrieved successfully", data: brands });
	} catch (error) {
		res.status(500).json({ status: 0, message: "Error retrieving brands from database", data: error });
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

router.post("/", checkTokenAdmin, validate(brandSchema), async (req, res) => {
	const { body: brand } = req;
	const duplicateBrand = await db.getDb().collection("productBrands").findOne({ name: brand.name.trim() });
	if(duplicateBrand) {
		res.status(200).json({ status: 1, message: `Brand with the name ${duplicateBrand.name} already exists.`, data: [] });
	} else {
		await db.getDb().collection("productBrands").insertOne(brand, (err, result) => {
			err ? res.status(500).json({ status: 0, message: "Error creating new brand", data: err })
			: res.status(201).json({ status: 1, message: "Product brand created successfully", data: result });
		});
	}
});

// modify brand
router.put("/update/:id", checkTokenAdmin, validate(brandSchema), async (req, res) => {
	const { id } = req.params;
	try {
		const brand = await db.getDb().collection("productBrands").findOne({ _id: ObjectId(id) });
		if(brand) {
			await db.getDb().collection("productBrands").updateOne(
				{ _id: ObjectId(id) },
				{ $set: {
					...req.body,
				} }
			)
			res.status(200).json({ status: 1, message: "Product brand updated successfully", data: req.body });
		} else {
			res.json({ status: 0, data: "Product brand with the provided ID not found"});
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ status: 0, message: "Update operation failed", data: error });
	}
});

// deactivate brand
router.put("/deactivate/:id", checkTokenAdmin, async (req, res) => {
	const { id } = req.params;
	try {
		const brand = await db.getDb().collection("productBrands").findOne({ _id: ObjectId(id) });
		if(brand) {
			if(!brand.isActive) {
				res.status(200).json({ status: 0, message: "Product brand is already inactive", data: [] })
			} else {
				await db.getDb().collection("productBrands").updateOne(
					{ _id: ObjectId(id) },
					{ $set: {
						...req.body,
						isActive: false,
						markedForDeletion: true
					} }
				)
				res.status(200).json({ status: 1, message: "Product brand deleted successfully" });
			}
		} else {
			res.status(200).json({ status: 0, message: "Product brand with the provided ID not found" });
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ status: 0, message: "Update operation failed", data: error });
	}
});

// delete brand
router.delete("/delete/:id", checkTokenAdmin, async (req, res) => {
	const { id } = req.params;
	try {
		const brand = await db.getDb().collection("productBrands").findOne({ _id: ObjectId(id) });
		if(brand) {
			const deleteItem = await db.getDb().collection("productBrands").deleteOne({ _id: ObjectId(id) });
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
