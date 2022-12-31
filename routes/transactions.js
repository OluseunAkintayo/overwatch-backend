const router = require('express').Router();
const transactionSchema = require('../models/transactionSchema');
const db = require('../connect/connect');
const { ObjectId } = require('mongodb');
const uuid = require('short-uuid');
const { checkToken } = require('./checkToken');

const id = uuid().uuid();

const validate = schema => async(req, res, next) => {
	try {
		await schema.validate(req.body);
		return next();
	} catch (error) {
		res.status(400).json({ status: 0, type: error.name, message: error.message });
	}
}

router.post("/order", checkToken, validate(transactionSchema), async (req, res, next) => {
	const { body: transaction, user: userId } = req;
	const user = await db.getDb().collection("users").findOne({ _id: ObjectId(userId.id) });
	let check = [];
	const products = transaction.products;
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
			});
			const currentTransaction = {
				...transaction,
				transactionId: id,
				user: user.firstName + " " + user.lastName
			}
			await db.getDb().collection("transactions").insertOne(currentTransaction, (err, result) => {
				err ? res.status(500).json({ status: 0, message: "Server error", data: err })
				: res.status(201).json({ status: 1, message: "Transaction completed!", data: result });
			});
		} else {
			res.json({ status: 0, message: "Some items have insufficient quantities" });
		}
	} catch (error) {
		res.json({ status: 0, message: "error", data: error });
		throw error;
	}
});

module.exports = router;
