import crypto from 'crypto';
import { supabase } from '@/app/lib/supabaseClient'; // Import Supabase client

export async function POST(req) {
    try {
        // Generate unique channel identifier
        const timestamp = new Date();
        const randomBytes = crypto.randomBytes(8).toString('hex');
        const channel = `${timestamp.getTime()}-${randomBytes}`;
        
        // Calculate expiration time (5 minutes from now)
        const expiresAt = new Date(timestamp.getTime() + 5 * 60 * 1000);

        // Store the session data in Supabase
        const { data, error } = await supabase.from('qr_sessions').insert([
            {
                channel,
                timestamp,
                status: 'pending',
                expires_at: expiresAt
            }
        ]);

        if (error) {
            throw new Error(`Supabase insert error: ${error.message}`);
        }

        // Return a successful response
        return new Response(JSON.stringify({
            success: true,
            msg: "QR Code generated",
            data: { channel }
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('QR generation error:', error);
        
        // Return an error response
        return new Response(JSON.stringify({
            success: false,
            msg: "Failed to generate QR code",
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
