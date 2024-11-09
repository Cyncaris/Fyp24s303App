const express = require('express');
const Pusher = require('pusher');
const cors = require('cors');
require('dotenv').config();

const app = express();
const jwt = require('jsonwebtoken');

app.use(cors());
app.use(express.json());

// Initialize Pusher
const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.NEXT_PUBLIC_PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    useTLS: true,
});

const key = process.env.PUSHER_SECRET; // Ensure `SECRET_KEY` is set in your environment variables
if (!key) {
    throw new Error('SECRET_KEY is missing');
}

const secretKey = process.env.JWT_SECRET;

// Store active sessions (for testing)
const activeSessions = new Map();

// Endpoint to check session status
app.get('/api/session-status/:channel', (req, res) => {
    const channel = req.params.channel;
    const session = activeSessions.get(channel);

    res.json({
        success: true,
        data: {
            status: session ? session.status : 'not_found'
        }
    });
});

// QR authentication endpoint
app.post('/api/authenticate-qr', async (req, res) => {
    const { channel, user_id } = req.body;
    console.log('Received authentication request:', { channel, user_id });
    try {
        // For testing, create a simple token


        // Update session status
        activeSessions.set(channel, {
            status: 'authenticated',
            user_id,
            timestamp: Date.now()
        });

        // Trigger Pusher event
        await pusher.trigger(
            `private-${channel}`,
            "login-event",
            {
                token: channel,
                user_id,
                timestamp: Date.now()
            }
        );

        console.log(`Authentication triggered for channel: ${channel}`);

        res.json({
            success: true,
            msg: "Authentication successful",
            data: { channel }
        });

    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({
            success: false,
            msg: "Authentication failed",
            error: error.message
        });
    }
});

app.post('/api/sign-token', async (req, res) => {
    const { username, userId } = req.body;

    // Validate request body
    if (!username || !userId) {
        return res.status(400).json({ message: 'Username and userId are required' });
    }

    // Payload to include in the token
    const payload = {
        id: userId, // Include userId in the payload
        username: username,
    };

    console.log('Signing token for user:', payload);

    // Sign the token (with a 1-hour expiration, for example)
    try {
        const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });
        // Send the token and userId in the response
        res.json({
            token: token,
            userId: userId,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error signing token', error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
});