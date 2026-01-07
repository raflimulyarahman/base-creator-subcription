import { Request, Response } from "express";
import db from '../models';

export const createUser = async (req: Request, res: Response) => {
  try {
    const { id_address, id_role, first_name, last_name, birth_years, country, jenis_kelamin, bio } = req.body;
    const newUser = await db.User.create({
      id_address,
        id_role,
      first_name,
      last_name,
      birth_years,
      country,
      jenis_kelamin,
      bio,
    });

    return res.status(201).json({
      message: "Users created successfully",
      data: newUser,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to create user",
      error: error.message,
    });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const users = await db.User.findAll({
      include: [
        { model: db.Address, as: "address" }, // alias harus sama dengan User.belongsTo
        { model: db.Role, as: "role" },       // alias sama dengan association Role
      ],
    });

    return res.status(200).json({ message: "Get users success", data: users });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: "Failed to get users", error: error.message });
  }
};

export const getUserId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // ambil id dari route parameter

    const user = await db.User.findOne({
      where: { id_users: id },
      include: [
        { model: db.Address, as: "address" }, // pastikan alias sama dengan User.belongsTo
        { model: db.Role, as: "role" },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    return res.status(200).json({
      message: "Get user success",
      data: user,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to get user",
      error: error.message,
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      birth_years,
      country,
      jenis_kelamin,
      bio,
      id_address,
      id_role
    } = req.body; 

    
    const user = await db.User.findOne({ where: { id_users: id } });
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    
    await user.update({
      first_name: first_name ?? user.first_name,
      last_name: last_name ?? user.last_name,
      birth_years: birth_years ?? user.birth_years,
      country: country ?? user.country,
      jenis_kelamin: jenis_kelamin ?? user.jenis_kelamin,
      bio: bio ?? user.bio,
      id_address: id_address ?? user.id_address,
      id_role: id_role ?? user.id_role
    });

    return res.status(200).json({
      message: "User berhasil diupdate",
      data: user
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Gagal mengupdate user",
      error: error.message
    });
  }
};