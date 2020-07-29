const jwt = require('jsonwebtoken');
const User = require('../models/user');

// ------------------------------------------------------------------------

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded._type != 'access') {
            throw new Error();
        }

        const user = await User.findOne({
            _id: decoded._id,
        });

        if (!user) {
            throw new Error();
        }

        if (req.header('CSRF-Token') != decoded._scrf) {
            throw new Error();
        }

        req.token = token;
        req.user = user;
        next();

    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.' });
    }
};

// ------------------------------------------------------------------------

const newToken = async (req, res, next) => {
    try {
        const refreshToken = req.cookies['RefreshToken'];
      
        const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_SECRET);

        if (decodedRefresh._type !== 'refresh') {
            throw new Error();
        }

        const user = await User.findOne({
            _id: decodedRefresh._id,
        });

        if (!user) {
            throw new Error();
        }

        if (req.header('CSRF-Token') != decodedRefresh._scrf) {
            throw new Error();
        }

        const tokens = await user.generateAuthToken();
        req.token = tokens.token;
        req.refreshToken = tokens.refreshToken;
        req.csrfToken = tokens.csrfToken;

        next();
    }
    catch (e) {
        res.status(401).send({ error: 'Token refresh failed.' });
    }
}

// ------------------------------------------------------------------------

module.exports = {
    auth,
    newToken
};


