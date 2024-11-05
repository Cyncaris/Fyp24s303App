import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  useTLS: true,
});

export async function POST(req) {
  console.log("API reached successfully");
  try {
    const { socket_id, channel_name } = await req.json();

    if (!socket_id || !channel_name) {
      return new Response(JSON.stringify({ error: 'Missing parameters' }), { status: 400 });
    }

    const auth = pusher.authorizeChannel(socket_id, channel_name);
    return new Response(JSON.stringify(auth), { status: 200 });
  } catch (error) {
    console.error('Error authenticating Pusher:', error);
    return new Response(JSON.stringify({ error: 'Pusher authentication failed' }), { status: 500 });
  }
}
