const AETHERION_DAY_MILESTONES = [
  {
    days: 1,
    name: "First Day",
    icon: "spark",
  },
  {
    days: 3,
    name: "Early Spark",
    icon: "sparks",
  },
  {
    days: 7,
    name: "First Week",
    icon: "sprout",
  },
  {
    days: 14,
    name: "Two Weeks",
    icon: "orbit",
  },
  {
    days: 30,
    name: "One Month",
    icon: "moon",
  },
  {
    days: 50,
    name: "50 Days",
    icon: "diamond",
  },
  {
    days: 75,
    name: "75 Days",
    icon: "star",
  },
  {
    days: 100,
    name: "100 Days",
    icon: "crystal",
  },
  {
    days: 150,
    name: "150 Days",
    icon: "rings",
  },
  {
    days: 200,
    name: "200 Days",
    icon: "gem",
  },
  {
    days: 300,
    name: "300 Days",
    icon: "flame",
  },
  {
    days: 365,
    name: "One Year",
    icon: "year",
  },
  {
    days: 500,
    name: "500 Days",
    icon: "crown",
  },
  {
    days: 750,
    name: "750 Days",
    icon: "comet",
  },
  {
    days: 1000,
    name: "1000 Days",
    icon: "trophy",
  },
  {
    days: 1500,
    name: "1500 Days",
    icon: "galaxy",
  },
  {
    days: 2000,
    name: "2000 Days",
    icon: "infinity",
  },
  {
    days: 2500,
    name: "2500 Days",
    icon: "constellation",
  },
  {
    days: 3650,
    name: "10 Years",
    icon: "planet",
  },
];

export const getAetherionDays = (createdAt) => {
  if (!createdAt) {
    return 0;
  }

  const created = new Date(createdAt);

  if (Number.isNaN(created.getTime())) {
    return 0;
  }

  const now = new Date();

  // Aetherion day 1 starts on the account creation day.
  const createdDate = new Date(
    created.getFullYear(),
    created.getMonth(),
    created.getDate(),
  );

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const difference = today.getTime() - createdDate.getTime();

  const days = Math.floor(difference / (1000 * 60 * 60 * 24)) + 1;

  return Math.max(days, 1);
};

export const getAetherionDayMilestone = (days) => {
  if (!days || days < 1) {
    return null;
  }

  let unlockedMilestone = null;

  for (const milestone of AETHERION_DAY_MILESTONES) {
    if (days >= milestone.days) {
      unlockedMilestone = milestone;
    } else {
      break;
    }
  }

  return unlockedMilestone;
};

export { AETHERION_DAY_MILESTONES };
