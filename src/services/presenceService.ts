import { getEcho } from './echo';

type Handler = () => void;

/**
 * Tracks who's actually connected right now (has the app open), via a
 * Reverb presence channel — separate from "exists in the users table".
 * The P2P call directory uses this to avoid letting anyone dial someone
 * who isn't actually reachable.
 */
class PresenceService {
  private onlineIds = new Set<number>();
  private joined = false;
  private handlers: Handler[] = [];

  join() {
    if (this.joined) return;
    this.joined = true;

    // Same reasoning as p2pCallService — this runs inside a useEffect, and
    // an uncaught throw there blanks the whole app via the error boundary.
    try {
      getEcho()
        .join('online-callers')
        .here((users: Array<{ id: number }>) => {
          this.onlineIds = new Set(users.map((u) => u.id));
          this.notify();
        })
        .joining((user: { id: number }) => {
          this.onlineIds.add(user.id);
          this.notify();
        })
        .leaving((user: { id: number }) => {
          this.onlineIds.delete(user.id);
          this.notify();
        });
    } catch (err) {
      console.error('[PresenceService] Failed to join presence channel', err);
      this.joined = false;
    }
  }

  leave() {
    if (!this.joined) return;
    this.joined = false;
    try {
      getEcho().leave('online-callers');
    } catch (err) {
      console.error('[PresenceService] Failed to leave presence channel', err);
    }
  }

  isOnline(userId: number) {
    return this.onlineIds.has(userId);
  }

  getOnlineIds() {
    return this.onlineIds;
  }

  onChange(fn: Handler) {
    this.handlers.push(fn);
    return () => {
      this.handlers = this.handlers.filter((h) => h !== fn);
    };
  }

  private notify() {
    this.handlers.forEach((fn) => fn());
  }
}

export const presenceService = new PresenceService();
export default presenceService;
