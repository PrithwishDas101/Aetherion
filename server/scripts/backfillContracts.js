import mongoose from "mongoose";
import dotenv from "dotenv";

import Chat from "../models/Chat.js";
import Contact from "../models/Contact.js";

dotenv.config();

const backfillContacts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to MongoDB.");

    const chats = await Chat.find({
      members: {
        $exists: true,
      },
    })
      .select("members")
      .lean();

    console.log(`Found ${chats.length} chats.`);

    const operations = [];

    for (const chat of chats) {
      if (!Array.isArray(chat.members)) {
        continue;
      }

      /*
       * Contacts are currently only for one-to-one chats.
       *
       * Ignore anything that is not exactly two members.
       */
      if (chat.members.length !== 2) {
        continue;
      }

      const [userA, userB] = chat.members;

      if (!userA || !userB) {
        continue;
      }

      if (String(userA) === String(userB)) {
        continue;
      }

      /*
       * A -> B
       */
      operations.push({
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
      });

      /*
       * B -> A
       */
      operations.push({
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
      });
    }

    if (operations.length === 0) {
      console.log("No contact relationships to create.");

      return;
    }

    const result = await Contact.bulkWrite(operations, {
      ordered: false,
    });

    console.log("Contact backfill completed.");

    console.log({
      matched: result.matchedCount,
      modified: result.modifiedCount,
      upserted: result.upsertedCount,
    });
  } catch (error) {
    console.error("Contact backfill failed:", error);

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();

    console.log("Disconnected from MongoDB.");
  }
};

backfillContacts();
