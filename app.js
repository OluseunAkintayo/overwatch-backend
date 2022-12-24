require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');


// const dbClient = new MongoClient("mongodb://localhost:27017", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });
// const connectDb = async () => {
//   try {
//     await dbClient.connect();
//     await dbClient.db("overwatch").command({ ping: 1 });
//     console.log("DB connected");
//   } catch(error) {
//     console.log(error);
//   }
// }
// connectDb();

const userRoute = require('./routes/user');
const productsRoute = require('./routes/products');
const brandsRoute = require('./routes/brands');
const categoriesRoute = require('./routes/categories');
const authRoute = require('./routes/auth');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/users', userRoute);
app.use('/api/products', productsRoute);
app.use('/api/products/brands', brandsRoute);
app.use('/api/products/categories', categoriesRoute);
app.use('/api/auth', authRoute);

app.get("/api", (req, res) => {
  res.send({ status: 200, message: "API works!" });
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;