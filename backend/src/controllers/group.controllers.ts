import { Request, Response } from "express";
import db from "../models";
import { Op } from "sequelize"; // If you need to perform any complex queries

export const createGroupChat = async (req: Request, res: Response) => {
  const { name_group, id_users } = req.body;

  // Mengizinkan foto_group menjadi string atau null
  const foto_group: string | null = req.file
    ? `${req.protocol}://${req.get("host")}/imagesGroup/${req.file.filename}`
    : null;

  const t = await db.sequelize.transaction();

  try {
    // Membuat Group Chat baru
    const newGroupChat = await db.GroupChat.create(
      {
        name_group,
        foto_group, // Menyimpan URL foto atau null
        id_users,
      },
      { transaction: t },
    );

    // Menambahkan member (admin) ke GroupChat
    await db.MemberGroupChat.create(
      {
        id_group_chat: newGroupChat.id_group_chat,
        id_users: id_users,
        role: "admin",
      },
      { transaction: t },
    );

    // Menyelesaikan transaksi
    await t.commit();

    // Mengirimkan response dengan data grup
    res.status(201).json(newGroupChat);
  } catch (error) {
    console.error(error);
    await t.rollback();
    res.status(500).send("Failed to create group chat.");
  }
};

export const getGroupChatAll = async (req: Request, res: Response) => {
  try {
    const { id_users } = req.body;

    // Fetch all group chats for the user
    const groupChats = await db.GroupChat.findAll({
      include: [
        // Fetch members of the group
        {
          model: db.User,
          as: "members",
          through: { attributes: [] }, // Exclude the join table data
          attributes: [
            "id_users",
            "first_name",
            "last_name",
            "foto",
            "username",
          ],
          where: { id_users: { [Op.eq]: id_users } }, // Only include groups the user is in
        },
        // Fetch the last message of the group chat (assuming MessageGroupChat exists)
        {
          model: db.MessageGroupChat,
          as: "messages",
          limit: 1, // Only the last message
          order: [["createdAt", "DESC"]], // Order by the newest message
          include: [
            {
              model: db.User,
              as: "user",
              attributes: ["id_users", "first_name", "last_name", "username"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]], // Order groups by creation time (optional)
    });

    // Format the response to return useful data
    const formattedGroupChats = groupChats.map((groupChat: any) => {
      const lastMessage = groupChat.messages?.[0] || null;

      return {
        id_group_chat: groupChat.id_group_chat,
        name_group: groupChat.name_group,
        foto_group: groupChat.foto_group,
        members: groupChat.members, // This contains the list of members
        lastMessage: lastMessage
          ? {
              message: lastMessage.message,
              date: lastMessage.createdAt,
              user: lastMessage.user, // User who sent the last message
            }
          : null,
      };
    });

    res.status(200).json(formattedGroupChats); // Return the formatted response
  } catch (error) {
    console.error("Failed to get all group chats:", error);
    res.status(500).json({ message: "Failed to get all group chats." });
  }
};
