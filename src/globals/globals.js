const crypto = require('crypto');


// ------------------------------------------------------------------------

const generateCSRFToken = () => {
    return crypto.randomBytes(32).toString('hex');
}

// ------------------------------------------------------------------------

const cookieParams = {
    httpOnly: true,
    expires: 0,
    // secure: true
};

// ------------------------------------------------------------------------

module.exports = {
    generateCSRFToken,
    cookieParams,
};