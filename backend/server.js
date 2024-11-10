const express = require('express');
const Pusher = require('pusher');
const cors = require('cors');
require('dotenv').config();
const cookieParser = require('cookie-parser');

const app = express();
const jwt = require('jsonwebtoken');
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());


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


// QR authentication endpoint
app.post('/api/authenticate-qr', async (req, res) => {
    const { channel, user_id } = req.body;
    console.log('Received authentication request:', { channel, user_id });
    try {

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

app.post('/api/gen-token', async (req, res) => {
    const { username, userId, userRole } = req.body;
    console.log('Received token request:', { username, userId });

    // Validate request body    
    if (!username || !userId) {
        return res.status(400).json({ 
            success: false,
            message: 'Username and userId are required' 
        });
    }

    // Payload to include in the token
    const payload = {
        id: userId,
        username: username,
        role: userRole,
        iat: Math.floor(Date.now() / 1000), // Issued at time
    };

    console.log('Signing token for user:', payload);

    try {
        const token = jwt.sign(payload, secretKey, { 
            expiresIn: '1h'  // 1 hour expiration
        });

        // Set cookie with enhanced security options
        res.cookie('authToken', token, { 
            httpOnly: true,  // Prevents JavaScript access
            secure: process.env.NODE_ENV === 'production',  // HTTPS only in production
            sameSite: 'strict',  // CSRF protection
            maxAge: 3600000,  // 1 hour in milliseconds
            path: '/',  // Cookie is available for all paths
            domain: process.env.NODE_ENV === 'production' ? 'yoursite.com' : 'localhost'
        });

        // Send success response
        return res.status(200).json({ 
            success: true,
            message: 'Token generated successfully',
            user: {
                userId,
                username
            }
        });

    } catch (error) {
        console.error('Token generation error:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Error generating token',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});


// Verify token middleware
function verifyToken(req, res, next) {
    const token = req.cookies.authToken;

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'No token provided' 
        });
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        
        // Attach user info to request object instead of sending response
        req.user = {
            userId: decoded.id,
            username: decoded.username,
            role: decoded.role
        };
        
        // Pass control to next middleware
        next();
        
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            res.clearCookie('authToken');
            return res.status(401).json({ 
                success: false,
                message: 'Token expired' 
            });
        }
        return res.status(401).json({ 
            success: false,
            message: 'Invalid token' 
        });
    }
}

// Separate route for token verification (for your frontend RoleBasedRoute)
app.get('/api/verify-token', verifyToken, (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
});

// Your protected route
app.get('/protected', verifyToken, (req, res) => {
    res.json({
        message: `Hello ${req.user.username}!`,
        userId: req.user.userId
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
});