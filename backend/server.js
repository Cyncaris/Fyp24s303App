const express = require('express');
const Pusher = require('pusher');
const cors = require('cors');
require('dotenv').config();

const app = express();

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
        const mockToken = `test_token_${Date.now()}`;
        
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
                token: mockToken,
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
});