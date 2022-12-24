const jwt = require('jsonwebtoken');

const { TOKEN_KEY } = process.env;

const check = (req, res, next) => {
	const header = req.headers.authorization;
	if(header) {
		const token = header.split(' ')[1];
		jwt.verify(token, TOKEN_KEY, (err, user) => {
			if(err) {
				res.status(403).json({ status: 0, message: "Invalid token" });
			} else {
				req.user = user;
				next();
			}
		})
	} else {
		res.status(401).json({ status: 0, message: "Unauthorized access" });
	}
}

const checkToken = (req, res, next) => {
	check(req, res, () => {
    if(req.user.id === req.params.id || req.user.isAdmin) {
      next();
    } else {
      res.status(403).json({ status: 0, message: "Unauthorized access"	});
    }
  });
}

const checkTokenAdmin = (req, res, next) => {
  checkToken(req, res, () => {
    if(req.user.isAdmin) {
      next();
    } else {
      res.status(403).json({ status: 0, message: "Unauthorized access" });
    }
  });
}

module.exports = { check, checkToken, checkTokenAdmin };