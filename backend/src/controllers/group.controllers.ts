import { Request, Response } from "express";
import db from "../models";
import { Op } from "sequelize"; // If you need to perform any complex queries
import {
  MemberGroupChatAttributes,
  MemberGroupChatCreationAttributes,
} from "../models/members";

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
    const createAdminGroup = await db.MemberGroupChat.create(
      {
        id_group_chat: newGroupChat.id_group_chat,
        id_users: id_users,
        role: "admin",
      },
      { transaction: t },
    );

    // Ambil semua anggota grup setelah admin ditambahkan
    const groupMembers = await db.MemberGroupChat.findAll({
      where: { id_group_chat: newGroupChat.id_group_chat },
      include: [
        {
          model: db.User,
          as: "user", // Ensure the alias matches the one defined in `MemberGroupChat`
          attributes: [
            "id_users",
            "username",
            "first_name",
            "last_name",
            "foto",
          ], // Attributes you want to include
        },
      ],
      transaction: t,
    });

    // Log groupMembers to inspect the structure of the response
    console.log("Fetched groupMembers:", groupMembers);

    // Now, we map through the groupMembers and correctly access `user` details
    const mappedMembers = groupMembers.map((member: any) => {
      // Access user details inside each member object
      const user = member.user || { username: "Unknown Creator" }; // Fallback if user is missing
      return user;
    });

    // Log the mapped members to verify correct data
    console.log("Mapped Members:", mappedMembers);

    // Send the response with updated group and member data
    res.status(201).json({
      groupChat: newGroupChat,
      admin: createAdminGroup,
      members: mappedMembers, // Sending the properly mapped user objects
    });
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

export const getIdGroup = async (req: Request, res: Response) => {
  try {
    // Ambil id_group_chat dari parameter URL
    const { id_group_chat } = req.params;
    console.log(id_group_chat);
    // Ambil data grup berdasarkan id_group_chat
    const group = await db.GroupChat.findOne({
      where: { id_group_chat },
    });

    // Jika grup tidak ditemukan
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Ambil member dari grup ini
    const members = await db.MemberGroupChat.findAll({
      where: { id_group_chat },
    });

    // Kembalikan data grup dan member
    res.status(200).json({
      message: "Success",
      group: group,
      members: members,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
