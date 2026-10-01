const EVENT_LIMITS = Object.freeze({
  "send-message": { max: 30, windowMs: 10 * 1000 },
  "poll-updated": { max: 20, windowMs: 10 * 1000 },
  typing: { max: 20, windowMs: 10 * 1000 },
  "stop-typing": { max: 20, windowMs: 10 * 1000 },
  "messages-read": { max: 30, windowMs: 10 * 1000 },
  "get-presence": { max: 10, windowMs: 10 * 1000 },
});

const MAX_TRACKED_USERS = 10_000;
const STALE_USER_MS = 60 * 1000;

export const createSocketEventLimiter = ({
  maxTrackedUsers = MAX_TRACKED_USERS,
  staleUserMs = STALE_USER_MS,
  now = Date.now,
} = {}) => {
  const users = new Map();

  const removeStaleUsers = (currentTime) => {
    for (const [userId, state] of users) {
      if (currentTime - state.lastSeen < staleUserMs) {
        break;
      }

      users.delete(userId);
    }
  };

  const allow = (userId, eventName) => {
    const policy = EVENT_LIMITS[eventName];

    if (!policy || userId === undefined || userId === null) {
      return false;
    }

    const key = String(userId);

    if (!key) {
      return false;
    }

    const currentTime = now();
    removeStaleUsers(currentTime);

    let state = users.get(key);

    if (state) {
      users.delete(key);
      state.lastSeen = currentTime;
      users.set(key, state);
    } else {
      if (users.size >= maxTrackedUsers) {
        users.delete(users.keys().next().value);
      }

      state = {
        lastSeen: currentTime,
        windows: new Map(),
      };
      users.set(key, state);
    }

    let eventWindow = state.windows.get(eventName);

    if (
      !eventWindow ||
      currentTime < eventWindow.startedAt ||
      currentTime - eventWindow.startedAt >= policy.windowMs
    ) {
      eventWindow = {
        startedAt: currentTime,
        count: 0,
      };
      state.windows.set(eventName, eventWindow);
    }

    if (eventWindow.count >= policy.max) {
      return false;
    }

    eventWindow.count += 1;

    return true;
  };

  return {
    allow,
    get trackedUsers() {
      return users.size;
    },
  };
};

export const socketEventLimiter = createSocketEventLimiter();