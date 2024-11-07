// pages/api/qr-code.js
import crypto from 'crypto';

// Store active sessions in memory (for testing only)
const activeSessions = new Map();

export async function POST(req) {
    try {
        // Generate random data for channel
        const timestamp = Date.now();
        const randomBytes = crypto.randomBytes(8).toString('hex');
        const channel = `${timestamp}-${randomBytes}`;
        
        console.log('Generated channel:', channel);
        // Store session data temporarily
        activeSessions.set(channel, {
            timestamp,
            status: 'pending'
        });

        // Clean up old sessions (older than 5 minutes)
        for (const [key, value] of activeSessions.entries()) {
            if (Date.now() - value.timestamp > 5 * 60 * 1000) {
                activeSessions.delete(key);
            }
        }

        return new Response(JSON.stringify({
            success: true,
            msg: "QR Code generated",
            data: {
                channel
            }
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('QR generation error:', error);
        return new Response(JSON.stringify({
            success: false,
            msg: "Failed to generate QR code"
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}