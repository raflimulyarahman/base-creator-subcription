import { Request, Response } from "express";
import db from "../models";

export const createSubscribe = async (req: Request, res: Response) => {
  try {
    const { subscibe } = req.body;
    const newSubscribe = await db.Subscribe.create({
      id_users: req.body.id_users,
      type_subscribe: req.body.type_subscribe,
      subscribe: req.body.subscribe,
      status_subscribe: req.body.status_subscribe,
    });

    return res.status(200).json({
      message: "Roles created successfully",
      data: newSubscribe,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to create user",
      error: error.message,
    });
  }
};

export const getSubscribe = async (req: Request, res: Response) => {
  try {
    const subscribes = await db.Subscribe.findAll({
      include: [{ model: db.User, as: "user" }],
    });
    return res
      .status(200)
      .json({ message: "Get subscribes success", data: subscribes });
  } catch (error: any) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Failed to get subscribes", error: error.message });
  }
};
