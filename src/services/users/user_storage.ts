import { v4 as uuidV4 } from 'uuid';
import bcrypt from 'bcrypt';
import { IUser } from "../../core/types/user";

const users: IUser[] = [
  {
    id: "user-001",
    name: "Admin User",
    email: "admin@example.com",
    password: bcrypt.hashSync("admin123", 10),
    role: "Admin",
    createdAt: new Date("2025-08-10T08:00:00.000Z"),
    updatedAt: new Date("2025-08-10T08:00:00.000Z")
  },
  {
    id: "user-002",
    name: "Editor User",
    email: "editor@example.com",
    password: bcrypt.hashSync("editor123", 10),
    role: "Editor",
    createdAt: new Date("2025-08-11T09:00:00.000Z"),
    updatedAt: new Date("2025-08-11T09:00:00.000Z")
  },
  {
    id: "user-003",
    name: "Viewer User",
    email: "viewer@example.com",
    password: bcrypt.hashSync("viewer123", 10),
    role: "Viewer",
    createdAt: new Date("2025-08-12T10:00:00.000Z"),
    updatedAt: new Date("2025-08-12T10:00:00.000Z")
  }
];

export const getAllUsers = (): Omit<IUser, 'password'>[] => {
  return users.map(({ password, ...user }) => user);
};

export const createUser = async (user: Partial<IUser> & { name: string; email: string; password: string; role: string }): Promise<Omit<IUser, 'password'>> => {
  const id = user.id ?? uuidV4();

  const existingUser = users.find(u => u.email === user.email);
  if (existingUser) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(user.password, 10);

  const newUser: IUser = {
    ...user,
    id,
    password: hashedPassword,
    role: user.role as any,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  users.push(newUser);
  
  const { password, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

export const getUserById = (id: string): Omit<IUser, 'password'> => {
  const found = users.find(user => user.id === id);
  
  if (!found) throw new Error(`User with id ${id} not found`);
  
  const { password, ...userWithoutPassword } = found;
  return userWithoutPassword;
};

export const getUserByEmail = (email: string): IUser | undefined => {
  return users.find(user => user.email === email);
};

export const updateUser = async (id: string, updates: Partial<IUser>): Promise<Omit<IUser, 'password'>> => {
  const userIndex = users.findIndex(user => user.id === id);
  
  if (userIndex === -1) {
    throw new Error(`User with id ${id} not found`);
  }


  let hashedPassword = users[userIndex].password;
  if (updates.password) {
    hashedPassword = await bcrypt.hash(updates.password, 10);
  }

  if (updates.email && updates.email !== users[userIndex].email) {
    const existingUser = users.find(u => u.email === updates.email && u.id !== id);
    if (existingUser) {
      throw new Error("Email already exists");
    }
  }

  const updatedUser: IUser = {
    ...users[userIndex],
    ...updates,
    id,
    password: hashedPassword,
    updatedAt: new Date(),
  };

  users[userIndex] = updatedUser;
  
  const { password, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
};

export const deleteUser = (id: string): void => {
  const userIndex = users.findIndex(user => user.id === id);
  
  if (userIndex === -1) {
    throw new Error(`User with id ${id} not found`);
  }

  users.splice(userIndex, 1);
};

export const validateUserCredentials = async (email: string, password: string): Promise<IUser | null> => {
  const user = getUserByEmail(email);
  
  if (!user) return null;
  
  const isValidPassword = await bcrypt.compare(password, user.password);
  
  return isValidPassword ? user : null;
};
