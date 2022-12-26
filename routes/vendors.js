const router = require('express').Router();
const { ObjectId } = require('mongodb');
const db = require('../connect/connect');
const vendorSchema = require('../models/VendorSchema');

// get all vendors
router.get("/list", async (req, res) => {
	try {
		const vendors = await db.getDb().collection("vendors").find().toArray();
		res.status(200).json({ status: 1, message: "Vendors retrieved successfully", data: vendors });
	} catch (error) {
		res.status(500).json({ status: 0, message: "Error retrieving vendors from database", data: error });
	}
});

// new vendor
const validate = (schema) => async(req, res, next) => {
	try {
		await schema.validate(req.body);
		return next();
	} catch (error) {
		res.status(400).json({ status: 0, type: error.name, message: error.message });
	}
}

router.post("/new", validate(vendorSchema), async (req, res) => {
	const { body: vendor } = req;
	const duplicateVendor = await db.getDb().collection("vendors").findOne({ name: vendor.companyName.trim() });
	if(duplicateVendor) {
		res.status(200).json({ status: 1, message: `Vendor with the name ${duplicateVendor.name} already exists.`, data: [] });
	} else {
		await db.getDb().collection("vendors").insertOne(vendor, (err, result) => {
			err ? res.status(500).json({ status: 0, message: "Error creating new vendor", data: err })
			: res.status(201).json({ status: 1, message: "Vendor created successfully", data: result });
		});
	}
});

// modify brand
router.put("/update/:id", validate(vendorSchema), async (req, res) => {
	const { id } = req.params;
	try {
		const vendor = await db.getDb().collection("vendors").findOne({ _id: ObjectId(id) });
		if(vendor) {
			await db.getDb().collection("vendors").updateOne(
				{ _id: ObjectId(id) },
				{ $set: {
					...req.body,
				} }
			)
			res.status(200).json({ status: 1, message: "Vendor updated successfully", data: req.body });
		} else {
			res.json({ status: 0, data: "Vendor with the provided ID not found"});
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
		const vendor = await db.getDb().collection("vendors").findOne({ _id: ObjectId(id) });
		if(vendor) {
			if(vendor.isActive) {
				res.status(200).json({ status: 1, message: "Vendor is already inactive", data: [] })
			} else {
				await db.getDb().collection("vendors").updateOne(
					{ _id: ObjectId(id) },
					{ $set: {
						...req.body,
						isActive: false
					} }
				)
				res.status(200).json({ status: 1, message: "Vendor deactivated successfully", data: vendor });
			}
		} else {
			res.status(200).json({ status: 0, message: "Vendor with the provided ID not found ", data: [] });
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ status: 0, message: "Update operation failed", data: error });
	}
});

// delete vendor
router.put("/delete/:id", async (req, res) => {
	const { id } = req.params;
	try {
		const vendor = await db.getDb().collection("vendors").findOne({ _id: ObjectId(id) });
		if(vendor) {
			await db.getDb().collection("vendors").updateOne(
				{ _id: ObjectId(id) },
				{ $set: {
					isActive: false,
					markedForDeletion: true
				} }
			);
			res.status(200).json({ status: 1, message: "Vendor deleted successfully", data: {} });
		} else {
			res.status(200).json({ status: 0, message: "Vendor with the provided ID not found ", data: [] });
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ status: 0, message: "Update operation failed", data: error });
	}
});
// router.put("/delete/:id", async (req, res) => {
// 	const { id } = req.params;
// 	try {
// 		const vendor = await db.getDb().collection("vendors").findOne({ _id: ObjectId(id) });
// 		if(vendor) {
// 			const deleteItem = await db.getDb().collection("vendors").deleteOne({ _id: ObjectId(id) });
// 			res.status(200).json({ status: 1, message: "Vendor deleted successfully", data: deleteItem });
// 		} else {
// 			res.status(200).json({ status: 0, message: "Vendor with the provided ID not found ", data: [] });
// 		}
// 	} catch (error) {
// 		console.log(error);
// 		res.status(500).json({ status: 0, message: "Update operation failed", data: error });
// 	}
// });

module.exports = router;
