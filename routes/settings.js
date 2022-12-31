const router = require('express').Router();
const orgSettingsSchema = require('../models/orgSchema');
const db = require("../connect/connect");
const { checkSuperAdmin } = require('./checkToken');
const { ObjectId } = require('mongodb');

const validate = (schema) => async(req, res, next) => {
	try {
		await schema.validate(req.body);
		return next();
	} catch (error) {
		res.status(400).json({ status: 0, type: error.name, message: error.message });
	}
}

router.get("/", checkSuperAdmin, async (req, res) => {
	const orgSetting = await db.getDb().collection("settings").find().toArray();
	res.status(200).json({ status: 1, data: orgSetting[0] });
});

router.post("/", checkSuperAdmin, validate(orgSettingsSchema), async (req, res) => {
	const { body: orgParams } = req;
	try {
		await db.getDb().collection("settings").insertOne(orgParams, (err, result) => {
			err ? res.status(500).json({ status: 0, message: "Error saving organization settings", data: err })
			: res.status(201).json({ status: 1, message: "Org settings saved successfully", data: result });
		});
	} catch (error) {
		res.status(500).json({ status: 0, data: JSON.stringify(error) });
	}
});

router.put("/update/:id", checkSuperAdmin, validate(orgSettingsSchema), async (req, res) => {
	const { body } = req;
	const { id } = req.params;
	try {
		const updateItem = await db.getDb().collection("settings").updateOne(
			{ _id: ObjectId(id) },
			{ $set: { ...body } }
		);
		res.status(200).json({ status: 1, message: 'Organization settings updated successfully', data: updateItem });
	} catch (error) {
		res.status(500).json({ status: 0, data: JSON.stringify(error) });
	}
});

module.exports = router;
