import { Request, Response } from "express";
import db from '../models';

export const createAddress = async (req: Request, res: Response) => {
  try {
    const { address, status_address } = req.body;
    const newAddress = await db.Address.create({
      address,
      status_address,
    });

    return res.status(201).json({
      message: "Address created successfully",
      data: newAddress,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to create user",
      error: error.message,
    });
  }
};

export const getAddress = async (req: Request, res: Response) => {}

export const getAddressId = async (req: Request, res: Response) => {}