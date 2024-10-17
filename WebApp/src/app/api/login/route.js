import QRCode from 'qrcode';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid'; // Import the uuid function

export async function POST(req) {
    const body = await req.json();

    // Generate a unique session ID
    const sessionId = uuidv4(); // Generates a new unique session ID

    const secret = process.env.JWT_SECRET;

    if (!secret) {
        return new Response(JSON.stringify({ error: 'JWT secret not set' }), {
            status: 500,
        });
    }

    // Generate a JWT token for the session
    const token = jwt.sign({ sessionId }, secret, { expiresIn: '1m' });

    // Generate QR code from the JWT token
    const qrCodeDataUrl = await QRCode.toDataURL(token);

    return new Response(JSON.stringify({ qrCodeDataUrl, sessionId }), { // Include sessionId in the response
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}