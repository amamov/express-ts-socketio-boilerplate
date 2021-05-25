import { Request, Response, NextFunction } from "express";
import * as bcrypt from "bcrypt";
import User from "../schema/User";

export const me = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    res.status(200).send({ success: false });
  } else {
    const user = req.user;
    res.status(200).send({
      success: true,
      user: user.readonly,
    });
  }
};

export const allUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await User.find({}).select("_id email username");
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
    email: string;
    username: string;
    password: string;
  };
  try {
    const { email, username, password }: body = req.body;
    if (!email || !username || !password) {
      throw new Error("email, username and password are reqiured");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, username, password: hashedPassword });
    await user.save();
    req.login(user, async (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      return res.status(201).send({ success: true, user: user.readonly });
    });
  } catch (error) {
    if (error.errors) {
      return res.status(400).send({ success: false, error: error.errors });
    }
    next(error);
  }
};
