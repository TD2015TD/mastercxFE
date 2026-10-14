import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// @ts-expect-error - Echo expects Pusher on window when using the pusher/reverb broadcaster
window.Pusher = Pusher;

let echoInstance: Echo<'reverb'> | null = null;

/**
 * Lazily creates (or returns the existing) Echo connection, authenticated
 * with this app's own JWT — not the Mitel token, this has nothing to do
 * with Mitel. Used for our own WebRTC call signaling channel.
 */
export function getEcho(): Echo<'reverb'> {
  if (echoInstance) return echoInstance;

  echoInstance = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: Number(import.meta.env.VITE_REVERB_PORT) || 443,
    wssPort: Number(import.meta.env.VITE_REVERB_PORT) || 443,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME || 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${import.meta.env.VITE_API_URL}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
      },
    },
  });

  return echoInstance;
}

export function disconnectEcho() {
  echoInstance?.disconnect();
  echoInstance = null;
}
