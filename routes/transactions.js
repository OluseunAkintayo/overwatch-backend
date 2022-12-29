const router = require('express').Router();
const transactionSchema = require('../models/transactionSchema');
const db = require('../connect/connect');
const { ObjectId } = require('mongodb');
const uuid = require('short-uuid');
const { checkToken } = require('./checkToken');

const id = uuid().uuid().toUpperCase();

const validate = schema => async(req, res, next) => {
	try {
		await schema.validate(req.body);
		return next();
	} catch (error) {
		res.status(400).json({ status: 0, type: error.name, message: error.message });
	}
}

router.post("/new-sale", checkToken, validate(transactionSchema), async (req, res, next) => {
	const { body: transaction, user: userId } = req;
	const user = await db.getDb().collection("users").findOne({ _id: ObjectId(userId.id) });
	let check = [];
	console.log(check);
	const products = transaction.products;
	for(i = 0; i < products.length; i++) {
		let item = await db.getDb().collection("products").findOne({ _id: ObjectId(products[i]._id) });
		if(item.quantity < products[i].added) {
			check = [...check, "fail"];
		}
	}
	console.log(check);

	if(check.length > 0) {
		res.status(403).status({ status: 0, message: "Some items have insufficient quantity. Please refresh the page" })
	} else if(check.length === 0) {
			try {
			transaction.products.forEach(async (item) => {
				const product = await db.getDb().collection("products").findOne({ _id: ObjectId(item._id) });
				check.push[item.added <= product.quantity];
				await db.getDb().collection("products").updateOne(
					{ _id: ObjectId(product._id) },
					{ 
						$set: {
							quantity: product.quantity - item.added,
							inStock: !(product.quantity - item.added === 0),
						}
					}
					)
					const currentTransaction = {
						...transaction,
						transactionId: id,
						user: user.firstName + " " + user.lastName
					}
					await db.getDb().collection("transactions").insertOne(currentTransaction, (err, result) => {
						err ? res.status(500).json({ status: 0, message: "Server error", data: err })
						: res.status(201).json({ status: 1, message: "Transaction completed!", data: result });
					})
				});
			} catch (error) {
			res.status(500).json({ status: 0, data: error });
		}
	}
});

module.exports = router;
