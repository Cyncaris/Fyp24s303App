import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabaseClient';

export async function POST(req) {
    try {
        // Parse the request body

        const body = await req.json();
        const channel = body.channel;

        if (!channel) {
            return NextResponse.json(
                { success: false, msg: "Channel token is required" },
                { status: 400 }
            );
        }
        // First check if session exists and is valid
        const { data: sessionData, error: sessionError } = await supabase
            .from('qr_sessions')
            .select('*')
            .eq('session_id', channel)
            .maybeSingle();

        if (sessionError) {
            console.error('Supabase error:', sessionError);
            return NextResponse.json(
                { success: false, msg: "Database error" },
                { status: 500 }
            );
        }

        if (!sessionData) {
            return NextResponse.json(
                { success: false, msg: "Invalid QR code" },
                { status: 404 }
            );
        }

        // Check if session has expired
        if (new Date() > new Date(sessionData.expires_at)) {
            // Update status to expired
            const { error: updateError } = await supabase
                .from('qr_sessions')
                .update({ status: 'expired' })
                .eq('session_id', channel);

            if (updateError) {
                console.error('Status update error:', updateError);
            }

            return NextResponse.json(
                { success: false, msg: "QR code has expired" },
                { status: 410 }
            );
        }

        // Update status to validated
        const { error: updateError } = await supabase
            .from('qr_sessions')
            .update({ status: 'validated' })
            .eq('session_id', channel);

        if (updateError) {
            console.error('Status update error:', updateError);
            return NextResponse.json(
                { success: false, msg: "Failed to update session status" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                msg: "Valid QR code",
                data: {
                    ...sessionData,
                    status: 'validated'
                }
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Session validation error:', error);
        return NextResponse.json(
            { success: false, msg: "Internal server error" },
            { status: 500 }
        );
    }
}