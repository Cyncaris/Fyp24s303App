// pages/api/pusher/auth.js
import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

export default async function handler(req, res) {
  const { socket_id, channel_name } = req.body;
  const authResponse = pusher.authenticate(socket_id, channel_name);
  res.send(authResponse);
}
