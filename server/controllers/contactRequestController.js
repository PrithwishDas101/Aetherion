import mongoose from "mongoose";

import Contact from "../models/Contact.js";
import ContactRequest from "../models/ContactRequest.js";
import User from "../models/User.js";
import { ensureContacts } from "./contactController.js";

const REQUESTER_PROJECTION =
  "_id firstName lastName profilePic avatarDecoration publicPresenceStatus lastSeen";

const getRequestUser = (request) => {
  if (!request?.requester) {
    return null;
  }

  return {
    ...request.requester,
    requestId: request._id,
    requestedAt: request.createdAt,
  };
};

// SEND CONTACT REQUEST
export const sendContactRequest = async (req, res) => {
  try {
    const requesterId = String(req.user.userId);
    const { recipientId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(recipientId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact ID.",
      });
    }

    const recipientObjectId = new mongoose.Types.ObjectId(recipientId);

    if (requesterId === String(recipientObjectId)) {
      return res.status(400).json({
        success: false,
        message: "You cannot send a contact request to yourself.",
      });
    }

    const recipient = await User.exists({
      _id: recipientObjectId,
    });

    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const existingContact = await Contact.exists({
      owner: requesterId,
      contact: recipientObjectId,
    });

    if (existingContact) {
      return res.status(409).json({
        success: false,
        message: "This user is already a contact.",
        code: "ALREADY_CONTACT",
      });
    }

    const existingOutgoingRequest = await ContactRequest.exists({
      requester: requesterId,
      recipient: recipientObjectId,
    });

    if (existingOutgoingRequest) {
      return res.status(409).json({
        success: false,
        message: "Contact request already sent.",
        code: "REQUEST_ALREADY_SENT",
      });
    }

    const incomingRequest = await ContactRequest.exists({
      requester: recipientObjectId,
      recipient: requesterId,
    });

    if (incomingRequest) {
      return res.status(409).json({
        success: false,
        message: "This user has already sent you a contact request.",
        code: "INCOMING_REQUEST_EXISTS",
      });
    }

    let request;

    try {
      request = await ContactRequest.create({
        requester: requesterId,
        recipient: recipientObjectId,
      });
    } catch (error) {
      // Unique index protects against duplicate concurrent requests.
      if (error?.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "Contact request already sent.",
          code: "REQUEST_ALREADY_SENT",
        });
      }

      throw error;
    }

    // Notify the recipient immediately if they are online.
    const io = req.app.get("io");

    if (io) {
      io.to(String(recipientObjectId)).emit("contact-request-received", {
        requestId: String(request._id),
        requesterId,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Contact request sent.",
      data: {
        requestId: request._id,
      },
    });
  } catch (error) {
    console.error("Send contact request error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to send contact request.",
    });
  }
};

// GET INCOMING CONTACT REQUESTS
export const getIncomingContactRequests = async (req, res) => {
  try {
    const recipientId = new mongoose.Types.ObjectId(String(req.user.userId));

    const search = String(req.query.search || "").trim();

    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);

    const limit = Math.min(
      Math.max(Number.parseInt(req.query.limit, 10) || 50, 1),
      100,
    );

    const skip = (page - 1) * limit;

    const pipeline = [
      {
        $match: {
          recipient: recipientId,
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "requester",
          foreignField: "_id",
          as: "requesterUser",
        },
      },

      {
        $unwind: "$requesterUser",
      },
    ];

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      pipeline.push({
        $match: {
          $or: [
            {
              "requesterUser.firstName": {
                $regex: escapedSearch,
                $options: "i",
              },
            },
            {
              "requesterUser.lastName": {
                $regex: escapedSearch,
                $options: "i",
              },
            },
            {
              $expr: {
                $regexMatch: {
                  input: {
                    $concat: [
                      "$requesterUser.firstName",
                      " ",
                      "$requesterUser.lastName",
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

    pipeline.push({
      $sort: {
        createdAt: -1,
      },
    });

    pipeline.push({
      $facet: {
        metadata: [
          {
            $count: "total",
          },
        ],

        requests: [
          {
            $skip: skip,
          },

          {
            $limit: limit,
          },

          {
            $project: {
              _id: 1,
              createdAt: 1,

              requester: {
                _id: "$requesterUser._id",
                firstName: "$requesterUser.firstName",
                lastName: "$requesterUser.lastName",
                profilePic: "$requesterUser.profilePic",
                avatarDecoration: "$requesterUser.avatarDecoration",
                publicPresenceStatus: "$requesterUser.publicPresenceStatus",
                lastSeen: "$requesterUser.lastSeen",
              },
            },
          },
        ],
      },
    });

    const [result] = await ContactRequest.aggregate(pipeline);

    const total = result?.metadata?.[0]?.total || 0;

    const requests = result?.requests || [];

    return res.status(200).json({
      success: true,
      data: requests,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + requests.length < total,
      },
    });
  } catch (error) {
    console.error("Get incoming contact requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch contact requests.",
    });
  }
};

// GET OUTGOING REQUESTS
export const getOutgoingContactRequests = async (req, res) => {
  try {
    const requesterId = new mongoose.Types.ObjectId(String(req.user.userId));

    const requests = await ContactRequest.find({
      requester: requesterId,
    })
      .sort({
        createdAt: -1,
      })
      .populate({
        path: "recipient",
        select: REQUESTER_PROJECTION,
      })
      .lean();

    return res.status(200).json({
      success: true,
      data: requests
        .filter((item) => item.recipient)
        .map((item) => ({
          ...item,
          recipient: item.recipient,
        })),
    });
  } catch (error) {
    console.error("Get outgoing contact requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch sent contact requests.",
    });
  }
};

// GET PENDING REQUEST COUNT
export const getContactRequestCount = async (req, res) => {
  try {
    const recipientId = String(req.user.userId);

    const count = await ContactRequest.countDocuments({
      recipient: recipientId,
    });

    return res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("Get contact request count error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch contact request count.",
    });
  }
};

// ACCEPT REQUEST
export const acceptContactRequest = async (req, res) => {
  try {
    const recipientId = String(req.user.userId);

    const { requestId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact request.",
      });
    }

    const request = await ContactRequest.findOne({
      _id: requestId,
      recipient: recipientId,
    }).lean();

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Contact request not found.",
      });
    }

    const requesterId = String(request.requester);

    await ensureContacts([recipientId, requesterId]);

    await ContactRequest.deleteOne({
      _id: request._id,
      recipient: recipientId,
    });

    const io = req.app.get("io");

    if (io) {
      io.to(requesterId).emit("contact-request-accepted", {
        requestId: String(request._id),
        contactId: recipientId,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Contact request accepted.",
    });
  } catch (error) {
    console.error("Accept contact request error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to accept contact request.",
    });
  }
};

// DECLINE REQUEST
export const declineContactRequest = async (req, res) => {
  try {
    const recipientId = String(req.user.userId);

    const { requestId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact request.",
      });
    }

    const request = await ContactRequest.findOneAndDelete({
      _id: requestId,
      recipient: recipientId,
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Contact request not found.",
      });
    }

    const io = req.app.get("io");

    if (io) {
      io.to(String(request.requester)).emit("contact-request-declined", {
        requestId: String(request._id),
      });
    }

    return res.status(200).json({
      success: true,
      message: "Contact request declined.",
    });
  } catch (error) {
    console.error("Decline contact request error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to decline contact request.",
    });
  }
};

// CANCEL OUTGOING REQUEST
export const cancelContactRequest = async (req, res) => {
  try {
    const requesterId = String(req.user.userId);

    const { requestId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact request.",
      });
    }

    const request = await ContactRequest.findOneAndDelete({
      _id: requestId,
      requester: requesterId,
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Contact request not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Contact request cancelled.",
    });
  } catch (error) {
    console.error("Cancel contact request error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to cancel contact request.",
    });
  }
};
