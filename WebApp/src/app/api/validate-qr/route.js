
export async function POST(req, res) {
    const { channel } = await req.json();

    if (!channel) {
        return res.status(400).json({ success: false, msg: "Channel is required" });
    }

    try {
        // Retrieve the session from Supabase
        const { data, error } = await supabase
            .from('qr_sessions')
            .select('*')
            .eq('channel', channel)
            .single();

        if (error || !data) {
            return res.status(404).json({ success: false, msg: "Session not found or invalid" });
        }

        // Check if session has expired
        if (new Date() > new Date(data.expires_at)) {
            return res.status(410).json({ success: false, msg: "Session expired" });
        }

        return res.status(200).json({ success: true, msg: "Session is valid", data });

    } catch (error) {
        console.error('Session validation error:', error);
        return res.status(500).json({ success: false, msg: "Failed to validate session" });
    }
}