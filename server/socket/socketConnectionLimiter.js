export const MAX_SOCKETS_PER_USER = 5;

export const createSocketConnectionLimiter = ({
  maxSocketsPerUser = MAX_SOCKETS_PER_USER,
} = {}) => {
  const socketsByUser = new Map();

  const getConnectionCount = (userId) =>
    socketsByUser.get(String(userId))?.size || 0;

  const middleware = (socket, next) => {
    const userId = socket.data?.userId;

    if (userId === undefined || userId === null || String(userId) === "") {
      return next(new Error("Authentication required"));
    }

    const key = String(userId);
    let userSockets = socketsByUser.get(key);

    if (userSockets?.size >= maxSocketsPerUser) {
      return next(new Error("Maximum active socket connections reached"));
    }

    if (!userSockets) {
      userSockets = new Set();
      socketsByUser.set(key, userSockets);
    }

    userSockets.add(socket);
    let released = false;

    socket.on("disconnect", () => {
      if (released) {
        return;
      }

      released = true;
      userSockets.delete(socket);

      if (userSockets.size === 0 && socketsByUser.get(key) === userSockets) {
        socketsByUser.delete(key);
      }
    });

    return next();
  };

  return {
    middleware,
    getConnectionCount,
  };
};