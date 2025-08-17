import type { Request, Response } from "express";
import {
  getAllUsers,
  createUser,
  updateUser,
  getUserById,
  deleteUser,
  validateUserCredentials,
} from "../services/users/user_storage";
import { generateToken, AuthRequest } from "../middlewares/auth";

const getAll = (_req: Request, res: Response) => {
  res.status(200).json(getAllUsers());
};

const get = (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = getUserById(id);
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: (error as Error).message });
  }
};

const create = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  try {
    const user = await createUser({ name, email, password, role });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, password, role } = req.body;

  try {
    const updatedUser = await updateUser(id, { name, email, password, role });
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(404).json({ message: (error as Error).message });
  }
};

const remove = (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    deleteUser(id);
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ message: (error as Error).message });
  }
};

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await validateUserCredentials(email, password);
    
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken({
      id: user.id!,
      email: user.email,
      role: user.role
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const getProfile = (req: AuthRequest, res: Response) => {
  try {
    const user = getUserById(req.user!.id);
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: (error as Error).message });
  }
};

export default {
  getAll,
  get,
  create,
  update,
  remove,
  login,
  getProfile,
};
