import { supabase } from "@/app/lib/supabaseClient";
import { NextResponse } from "next/server";

// GET method handler
export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");

    if (!user_id) {
        return NextResponse.json({ error: 'Missing user_id in the query parameters' }, { status: 400 });
    }

    try {
        const { data, error } = await supabase
            .from('useraccount')
            .select('*')
            .eq('id', user_id)
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            data: {
                user_id: data.id,
                email: data.email,
                name: `${data.first_name} ${data.last_name}`,
                role_id: data.role_id,
            }
        }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}