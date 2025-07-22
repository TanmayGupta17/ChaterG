const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const checkForAuthentication = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized access' });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'UnAuthorized access' });
        req.user = user;
        next();
    });
}

module.exports = checkForAuthentication;