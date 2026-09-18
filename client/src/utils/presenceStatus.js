export const PRESENCE_STATUS = {
  AUTOMATIC: "automatic",
  ONLINE: "online",
  OFF_PLANET: "off_planet",
  IDLE: "idle",
  DND: "dnd",
};

export const getEffectivePresenceStatus = ({ user, livePresence }) => {
  const publicStatus = user?.publicPresenceStatus || PRESENCE_STATUS.AUTOMATIC;

  if (publicStatus !== PRESENCE_STATUS.AUTOMATIC) {
    return publicStatus;
  }

  return livePresence?.online
    ? PRESENCE_STATUS.ONLINE
    : PRESENCE_STATUS.OFF_PLANET;
};

export const isUserOnline = ({ user, livePresence }) => {
  return (
    getEffectivePresenceStatus({
      user,
      livePresence,
    }) === PRESENCE_STATUS.ONLINE
  );
};

export const getPresenceIndicator = (status) => {
  switch (status) {
    case PRESENCE_STATUS.ONLINE:
      return {
        type: "online",
        label: "Online",
      };

    case PRESENCE_STATUS.OFF_PLANET:
      return {
        type: "off_planet",
        label: "Off Planet",
      };

    case PRESENCE_STATUS.IDLE:
      return {
        type: "idle",
        label: "Idle",
      };

    case PRESENCE_STATUS.DND:
      return {
        type: "dnd",
        label: "Do Not Disturb",
      };

    default:
      return {
        type: "off_planet",
        label: "Off Planet",
      };
  }
};
