import config from "../global/env";
import { Request, Response, NextFunction } from "express";
import * as bcrypt from "bcrypt";
import User, { IUserDocument } from "../schema/User";

export const allUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await User.find({});
    res.status(200).send({ success: true, users });
  } catch (error) {
    next(error);
  }
};

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  type body = {
    username: string;
    password: string;
    age?: number;
  };
  try {
    const { username, password, age }: body = req.body;
    if (!username || !password) {
      throw new Error("username and password are reqiured");
    }
    const hashedPassword = await bcrypt.hash(password, 10); // 비밀먼호 암호화
    const user = new User({ username, password: hashedPassword, age });
    await user.save();
    // const user = await User.register({ username, age } as IUser, password);
    res.status(201).send({ success: true, user });
  } catch (error) {
    next(error);
  }
};
