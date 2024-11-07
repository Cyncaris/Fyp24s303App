// File: /backend/server.js

const express = require('express');
const Pusher = require('pusher');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pusher = new Pusher({
    appId: 'YOUR_APP_ID',
    key: 'YOUR_PUSHER_KEY',
    secret: 'YOUR_PUSHER_SECRET',
    cluster: 'YOUR_CLUSTER',
    useTLS: true,
});

// API Endpoint for authenticating QR sessions
app.post('/api/authenticate-qr', async (req, res) => {
    const { sessionId, userId } = req.body;
    console.log(`Authenticating user ${userId} for session ${sessionId}`);
    try {
        await pusher.trigger(`qr-login-${sessionId}`, 'authenticated', { userId });
        res.status(200).send({ status: 'Success' });
    } catch (error) {
        res.status(500).send({ error: 'Authentication failed', details: error });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});
