const { MongoClient } = require("mongodb");
const app = require('express')();

console.log(app.settings.env);

const connectionUrl = "mongodb://localhost:27017";

// const client = new MongoClient(process.env.DB_URL, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });
const client = new MongoClient(connectionUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let dbConnection;

module.exports = {
  connectToServer: function (callback) {
    client.connect((err, db) => {
      if (err || !db) {
        return callback(err);
      }
      dbConnection = db.db("overwatch");
      console.log("Successfully connected to MongoDB.");
      return callback();
    });
  },
  getDb: function () {
    return dbConnection;
  },
};
