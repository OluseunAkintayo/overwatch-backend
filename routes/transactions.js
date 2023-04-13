const router = require('express').Router();
const transactionSchema = require('../models/transactionSchema');
const db = require('../connect/connect');
const { ObjectId } = require('mongodb');
const { checkToken, checkTokenAdmin } = require('./checkToken');

const validate = schema => async(req, res, next) => {
	try {
		await schema.validate(req.body);
		return next();
	} catch (error) {
		res.status(400).json({ status: 0, type: error.name, message: error.message });
	}
}

router.post("/new-sale", checkToken, async (req, res, next) => {
	const { body: transaction, user: userId } = req;
	const { customerName, transactionId, transactionDate, products, transactionType } = transaction;
	const user = await db.getDb().collection("users").findOne({ _id: ObjectId(userId.id) });
	let check = [];
	for(i = 0; i < products.length; i++) {
		let item = await db.getDb().collection("products").findOne({ _id: ObjectId(products[i]._id) });
		if(item.quantity < products[i].orderQty) {
			check = [...check, "fail"];
		}
	}

	try {
		if(check.length === 0) {
			transaction.products.forEach(async (item) => {
				const product = await db.getDb().collection("products").findOne({ _id: ObjectId(item._id) });
				await db.getDb().collection("products").updateOne(
					{ _id: ObjectId(product._id) },
					{
						$set: {
							quantity: product.quantity - item.orderQty,
							inStock: !(product.quantity === item.orderQty),
						}
					}
				);
				const { _id, ...props } = item;
				const { passcode, designation, isActive, createdAt, modifiedAt, ...userProps } = user;
				await db.getDb().collection("productReport").insertOne({ ...props, productId: _id, transactionId, transactionDate, transactionType, customer: customerName, user: userProps });
			});
			const currentTransaction = { ...transaction, user: user.firstName + " " + user.lastName };
			await db.getDb().collection("transactions").insertOne(currentTransaction, (err, result) => {
				err ? res.status(500).json({ status: 0, message: "Server error", data: err })
				: res.status(201).json({ status: 1, message: "Transaction completed!", data: result });
			});
		} else {
			res.json({ status: 0, message: "Some items have insufficient quantities" });
		}
	} catch (error) {
		res.json({ status: 0, message: "error", data: error });
	}
});

router.get("/sales", checkTokenAdmin, async (req, res) => {
	try {
		const transactions = await db.getDb().collection("transactions").find().toArray();
		res.status(200).json({ status: 1, data: transactions });
	} catch (error) {
		res.status(500).json({ status: 0, message: "Error retrieving report", data: JSON.stringify(error) });
	}
})

module.exports = router;
