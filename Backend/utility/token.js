const jwt = require('jsonwebtoken');
require('dotenv').config();

// Function to generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,        // or user.id
            email: user.email,
            role: user.role      // optional: add any user info
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN
        }
    );
};

module.exports = generateToken;