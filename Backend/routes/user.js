const express = require('express');
const router = express.Router();
const { handleUserLogin, handleUserSignup } = require('../controller/user');

router.get('/me', (req, res) => {
    res.send('User profile data');
})

router.post('/login', handleUserLogin);
router.post('/signup', handleUserSignup);

module.exports = router;