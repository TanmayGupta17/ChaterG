const express = require('express');
const pool = require('../db');

const CreateChat = async (req, res) => {
    try {
        const result = await pool.query('INSERT INTO chats (title,created_at) VALUES ($1, NOW()) RETURNING *', [req.body.title || '']);
        res.status(201).json({ message: 'Chat created successfully', chat: result.rows[0] });
    }
    catch (error) {
        console.error('Error creating chat:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const getChatMessages = async (req, res) => {
    try {
        const chatId = req.params.id;
        const result = await pool.query(
            'SELECT * FROM messages WHERE chat_id = $1 ORDER BY timestamp ASC',
            [chatId]
        );
        res.json({ messages: result.rows });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const sendMessage = async (req, res) => {
    const chatId = req.params.id;
    const { message } = req.body;

    try {
        // Save user message
        await pool.query(
            'INSERT INTO messages (chat_id, role, content, timestamp) VALUES ($1, $2, $3, NOW())',
            [chatId, 'user', message]
        );

        const titleResult = await pool.query('SELECT title FROM chats WHERE id = $1', [chatId]);
        if (!titleResult.rows[0].title) {
            const generatedTitle = message.trim().split(/\s+/).slice(0, 6).join(' '); // first 6 words
            await pool.query('UPDATE chats SET title = $1 WHERE id = $2', [generatedTitle, chatId]);
        }

        // Set headers to stream response
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Transfer-Encoding', 'chunked');

        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'gemma', // Or 'llama3', etc.
                prompt: message,
                stream: true
            })
        });

        if (!response.ok || !response.body) {
            throw new Error('Failed to connect to Ollama');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let assistantResponse = '';

        while (!done) {
            const { value, done: doneReading } = await reader.read();
            done = doneReading;
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(Boolean);
            for (const line of lines) {
                try {
                    const parsed = JSON.parse(line);
                    const token = parsed.response || '';
                    assistantResponse += token;
                    res.write(token); // Stream token to frontend
                } catch (err) {
                    console.error('JSON parse error:', err);
                }
            }
        }

        await pool.query(
            'INSERT INTO messages (chat_id, role, content, timestamp) VALUES ($1, $2, $3, NOW())',
            [chatId, 'assistant', assistantResponse]
        );

        res.end(); // End stream

    } catch (error) {
        console.error('Error in sendMessage:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

const stopChat = async (req, res) => {
    res.status(200).json({ message: 'Stopped generation (mock)' });
};

const getAllChats = async (req, res) => {
    try {
        const result = await pool.query('SELECT id, title , created_at FROM chats ORDER BY created_at DESC;');
        console.log('Fetched chats:', result);
        return res.status(200).json(result.rows);
    } catch (error) {
        console.error('Failed to fetch chat list:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    CreateChat,
    getChatMessages,
    sendMessage,
    getAllChats,
    stopChat,
};