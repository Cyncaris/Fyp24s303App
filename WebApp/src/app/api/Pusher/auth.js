// pages/api/pusher/auth.js

import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  useTLS: true,
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { socket_id, channel_name } = req.body;
    try {
      // Authenticate the request
      const authResponse = pusher.authenticate(socket_id, channel_name);
      res.status(200).send(authResponse);
      
      // **Log the event data and trigger the test event**
      const eventData = { message: 'Test message from server' };
      console.log('Sending event data:', eventData);

      pusher.trigger(channel_name, 'login-event', eventData);
      console.log('Test event triggered on channel:', channel_name);

    } catch (error) {
      console.error('Error authenticating Pusher:', error);
      res.status(500).send({ error: 'Pusher authentication failed' });
    }
  } else {
    res.status(405).send({ error: 'Method Not Allowed' });
  }
}
