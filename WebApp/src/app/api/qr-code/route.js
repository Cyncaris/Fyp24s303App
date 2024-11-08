import crypto from 'crypto';
import { supabase } from '@/app/lib/supabaseClient';
import { NextResponse } from 'next/server';

const SESSION_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

function generateSecureToken(length = 32) {
    // Generate random bytes
    const buffer = crypto.randomBytes(length);
    
    // Convert to Base64URL format (URL-safe characters)
    return buffer.toString('base64url');
}

function shuffleString(str) {
    const arr = str.split('');
    for (let i = arr.length - 1; i > 0; i--) {
        const j = crypto.randomInt(0, i + 1);
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
}

async function generateSessionId() {
    // Generate multiple random components
    const randomPart1 = generateSecureToken(16);
    const randomPart2 = generateSecureToken(16);
    
    // Get current timestamp in nanoseconds for added uniqueness
    const hrTime = process.hrtime();
    const timeNano = hrTime[0] * 1000000000 + hrTime[1];
    
    // Convert timestamp to Base64URL
    const timeComponent = Buffer.from(timeNano.toString()).toString('base64url');
    
    // Combine and shuffle all components
    const combinedString = `${randomPart1}${timeComponent}${randomPart2}`;
    const sessionId = shuffleString(combinedString);
    
    // Verify uniqueness against database
    const { data } = await supabase
        .from('qr_sessions')
        .select('session_id')
        .eq('session_id', sessionId)
        .single();
    
    // If collision occurs (extremely unlikely), generate new ID
    if (data) {
        return generateSessionId();
    }
    
    return sessionId;
}

export async function POST(req) {
    try {
        // Generate unique session ID
        const sessionId = await generateSessionId();
        
        // Calculate expiration time
        const timestamp = new Date();
        const expiresAt = new Date(timestamp.getTime() + SESSION_DURATION);

        // Store the session with additional security fields
        const { error } = await supabase.from('qr_sessions').insert([
            {
                session_id: sessionId,
                created_at: timestamp,
                status: 'pending',
                expires_at: expiresAt,
                // creation_ip: req.headers.get('x-forwarded-for') || req.ip,
                // user_agent: req.headers.get('user-agent'),
                // last_accessed: timestamp
            }
        ]);

        if (error) {
            throw new Error('Failed to create session');
        }

        // Return successful response
        return NextResponse.json({
            success: true,
            data: {
                sessionId,
                expiresAt
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Session creation error:', error);
        
        return NextResponse.json({
            success: false,
            message: 'Failed to generate session',
        }, { status: 500 });
    }
}