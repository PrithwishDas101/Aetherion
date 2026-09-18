// automatic, online, off_planet, idle, dnd
export const emitPublicPresenceUpdated = (io, userId, publicPresenceStatus) => {
  if (!io || !userId || !publicPresenceStatus) {
    return;
  }

  io.emit("public-presence-updated", {
    userId: String(userId),
    publicPresenceStatus,
  });
};
