const express = require('express');
const router = express.Router();
const { CreateChat, getChatMessages, sendMessage, stopChat, getAllChats } = require('../controller/chat');

router.post('/', CreateChat);
router.get('/allchats', getAllChats);
router.get('/:id', getChatMessages);
router.post('/:id/message', sendMessage);
router.post('/:id/stop', stopChat);



module.exports = router;