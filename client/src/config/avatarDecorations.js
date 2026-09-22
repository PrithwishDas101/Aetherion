export const AVATAR_DECORATIONS = {
  none: {
    id: "none",
    name: "None",
    description: "No avatar decoration.",
  },

  aetherOrbit: {
    id: "aether-orbit",
    name: "Aether Orbit",
    description: "A restrained orbital frame formed from the Aetherion signal.",
  },

  initial: {
    id: "initial",
    name: "Initial",
    description: "An ornate Aetherion frame inspired by the first signal.",
  },

  moonlit: {
    id: "moonlit",
    name: "Moonlit",
    description: "A luminous lunar frame with a polished crescent, radiant orb, and four celestial sparkles.",
  },
};

export const getAvatarDecoration = (decorationId) => {
  return (
    Object.values(AVATAR_DECORATIONS).find(
      (decoration) => decoration.id === decorationId,
    ) || AVATAR_DECORATIONS.none
  );
};
