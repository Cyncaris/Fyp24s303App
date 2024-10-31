import QRCode from 'qrcode';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

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
    let qrCodeDataUrl;
    try {
        qrCodeDataUrl = await QRCode.toDataURL(token);
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to generate QR code' }), {
            status: 500,
        });
    }

    // Improved date formatting (consider using a library for more complex needs)
    const date = new Date();
    const channel_data = `${date.getDate()}-${date.getMonth() + 1}-${date.getMinutes()}`;
    const channel_data_hash = crypto.createHash('md5').update(`${channel_data}||${qrCodeDataUrl}`).digest('hex');

    return new Response(JSON.stringify({ channel_data_hash, sessionId }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}
