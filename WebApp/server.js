const express = require('express');
const Pusher = require('pusher');
const cors = require('cors');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = express();
    
    // Add these middleware before your routes
    server.use(cors());
    server.use(express.json());  // Add this line to parse JSON bodies
    server.use(express.urlencoded({ extended: true }));  // Add this line to parse URL-encoded bodies

    // Backend API route
    server.post('/api/authenticate-qr', async (req, res) => {
        console.log('POST /api/authenticate-qr');
        const { sessionId, userId } = req.body;
        console.log(`Authenticating user ${userId} for session ${sessionId}`);

        try {
            // Replace with your actual logic
            res.status(200).send({ status: 'Authenticated' });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).send({ error: 'Authentication failed', details: error.message });
        }
    });

    // All other routes handled by Next.js
    server.all('*', (req, res) => {
        return handle(req, res);
    });

    // Start server
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, (err) => {
        if (err) throw err;
        console.log(`> Server ready on http://localhost:${PORT}`);
    });
});