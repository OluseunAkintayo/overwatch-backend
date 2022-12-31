const jwt = require('jsonwebtoken');

const { TOKEN_KEY } = process.env;

const check = (req, res, next) => {
	const authToken = req.headers.authorization;
	if(authToken) {
		const token = authToken.split(' ')[1];
		jwt.verify(token, TOKEN_KEY, (err, user) => {
			if(err) {
				res.status(403).json({ status: 0, message: "Unauthorized access: invalid token" });
			} else {
				req.user = user;
				next();
			}
		})
	} else {
		res.status(401).json({ status: 0, message: "Unauthorized access: token not found" });
	}
}

const checkToken = (req, res, next) => {
	check(req, res, () => {
    if(req.user.id === req.params.id || req.user.isAdmin || req.user.isSuperAdmin) {
      next();
    } else {
      res.status(403).json({ status: 0, message: "Unauthorized access: provided token not valid for specified user or the user is not an admin."	});
    }
  });
}

const checkTokenAdmin = (req, res, next) => {
  checkToken(req, res, () => {
    if(req.user.isAdmin || req.user.isSuperAdmin) {
      next();
    } else {
      res.status(403).json({ status: 0, message: "Unauthorized access: user is not an admin" });
    }
  });
}

const checkSuperAdmin = (req, res, next) => {
	checkTokenAdmin(req, res, () => {
		if(req.user.isSuperAdmin) {
			next();
		} else {
      res.status(403).json({ status: 0, message: "Unauthorized access: user is not a super admin" });
    }
	})
}

module.exports = { check, checkToken, checkTokenAdmin, checkSuperAdmin };