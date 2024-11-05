import Pusher from 'pusher';
import { sessions } from './generate-QR';

const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER,
    useTLS: true,
});

export default function handler(req, res) {
    const { sessionId } = req.body;
    const userToken = req.headers.authorization?.split(" ")[1];

    const isValidSession = sessions[sessionId] && (Date.now() - sessions[sessionId].createdAt < 300000); // 5 mins
    const isAuthenticatedUser = userToken === "valid-token"; // Mock validation

    if (isValidSession && isAuthenticatedUser) {
        pusher.trigger("login-channel", "login-success", { sessionId });
        delete sessions[sessionId];
        return res.status(200).json({ success: true });
    } else {
        return res.status(401).json({ success: false });
    }
}
