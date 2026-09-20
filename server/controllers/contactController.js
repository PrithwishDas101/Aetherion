import mongoose from "mongoose";

import Contact from "../models/Contact.js";

const CONTACT_PROJECTION =
  "_id firstName lastName profilePic publicPresenceStatus lastSeen";

// ENSURE TWO USERS ARE CONTACTS
export const ensureContacts = async (members) => {
  if (!Array.isArray(members) || members.length !== 2) {
    throw new Error("A one-to-one contact relationship requires two users.");
  }

  const [userA, userB] = members.map(String);

  if (userA === userB) {
    throw new Error("A user cannot be their own contact.");
  }

  await Contact.bulkWrite([
    {
      updateOne: {
        filter: {
          owner: userA,
          contact: userB,
        },

        update: {
          $setOnInsert: {
            owner: userA,
            contact: userB,
          },
        },

        upsert: true,
      },
    },

    {
      updateOne: {
        filter: {
          owner: userB,
          contact: userA,
        },

        update: {
          $setOnInsert: {
            owner: userB,
            contact: userA,
          },
        },

        upsert: true,
      },
    },
  ]);
};

// GET RECENT CONTACTS
export const getRecentContacts = async (req, res) => {
  try {
    const ownerId = req.user.userId;

    const contacts = await Contact.find({
      owner: ownerId,
    })
      .sort({
        createdAt: -1,
      })
      .limit(5)
      .populate({
        path: "contact",
        select: CONTACT_PROJECTION,
      })
      .lean();

    const data = contacts
      .filter((item) => item.contact)
      .map((item) => ({
        ...item.contact,
        addedAt: item.createdAt,
      }));

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get recent contacts error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch recent contacts.",
    });
  }
};

// GET FULL CONTACT LIST
export const getContacts = async (req, res) => {
  try {
    const ownerId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(ownerId)) {
      return res.status(401).json({
        success: false,
        message: "Invalid user.",
      });
    }

    const search = String(req.query.search || "").trim();

    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);

    const limit = Math.min(
      Math.max(Number.parseInt(req.query.limit, 10) || 50, 1),
      100,
    );

    const skip = (page - 1) * limit;

    const ownerObjectId = new mongoose.Types.ObjectId(ownerId);

    const pipeline = [
      /*
       * Only contacts belonging to current user.
       */
      {
        $match: {
          owner: ownerObjectId,
        },
      },

      /*
       * Get the actual User document.
       */
      {
        $lookup: {
          from: "users",
          localField: "contact",
          foreignField: "_id",
          as: "contactUser",
        },
      },

      {
        $unwind: "$contactUser",
      },
    ];

    /*
     * SEARCH MODE
     *
     * Search:
     * - first name
     * - last name
     * - full name
     */
    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      pipeline.push({
        $match: {
          $or: [
            {
              "contactUser.firstName": {
                $regex: escapedSearch,
                $options: "i",
              },
            },

            {
              "contactUser.lastName": {
                $regex: escapedSearch,
                $options: "i",
              },
            },

            {
              $expr: {
                $regexMatch: {
                  input: {
                    $concat: [
                      "$contactUser.firstName",
                      " ",
                      "$contactUser.lastName",
                    ],
                  },

                  regex: escapedSearch,

                  options: "i",
                },
              },
            },
          ],
        },
      });
    }

    /*
     * Full contacts list is always alphabetical.
     */
    pipeline.push({
      $sort: {
        "contactUser.firstName": 1,
        "contactUser.lastName": 1,
      },
    });

    /*
     * Return total + paginated contacts.
     */
    pipeline.push({
      $facet: {
        metadata: [
          {
            $count: "total",
          },
        ],

        contacts: [
          {
            $skip: skip,
          },

          {
            $limit: limit,
          },

          {
            $project: {
              _id: "$contactUser._id",

              firstName: "$contactUser.firstName",

              lastName: "$contactUser.lastName",

              profilePic: "$contactUser.profilePic",

              publicPresenceStatus: "$contactUser.publicPresenceStatus",

              lastSeen: "$contactUser.lastSeen",

              addedAt: "$createdAt",
            },
          },
        ],
      },
    });

    const [result] = await Contact.aggregate(pipeline);

    const total = result?.metadata?.[0]?.total || 0;

    const contacts = result?.contacts || [];

    return res.status(200).json({
      success: true,

      data: contacts,

      pagination: {
        page,
        limit,
        total,

        hasMore: skip + contacts.length < total,
      },
    });
  } catch (error) {
    console.error("Get contacts error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch contacts.",
    });
  }
};

// REMOVE CONTACT
export const removeContact = async (req, res) => {
  try {
    const ownerId = String(req.user.userId);
    const { contactId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(contactId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact.",
      });
    }

    if (ownerId === String(contactId)) {
      return res.status(400).json({
        success: false,
        message: "You cannot remove yourself.",
      });
    }

    const result = await Contact.deleteMany({
      $or: [
        {
          owner: ownerId,
          contact: contactId,
        },

        {
          owner: contactId,
          contact: ownerId,
        },
      ],
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Contact relationship not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Contact removed successfully.",
    });
  } catch (error) {
    console.error("Remove contact error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to remove contact.",
    });
  }
};
