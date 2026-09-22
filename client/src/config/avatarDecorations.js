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
};

export const getAvatarDecoration = (decorationId) => {
  return (
    Object.values(AVATAR_DECORATIONS).find(
      (decoration) => decoration.id === decorationId,
    ) || AVATAR_DECORATIONS.none
  );
};
