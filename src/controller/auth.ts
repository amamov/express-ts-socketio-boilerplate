import config from "../global/env";
import { Request, Response, NextFunction } from "express";
import * as bcrypt from "bcrypt";
import * as passport from "passport";
import * as jwt from "jsonwebtoken";
import User, { IUserDocument } from "../schema/User";

export const localLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate("local", (serverError, user, clientError) => {
    if (serverError) {
      console.error(serverError);
      return next(serverError);
    }
    if (clientError) {
      console.error(clientError);
      return next(clientError);
    }
    req.login(user, async (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      return res.status(200).send({ success: true, user: user.readonly }); // 쿠키와 함께 응답
    });
  })(req, res, next);
};

export const logout = (req: Request, res: Response, next: NextFunction) => {
  req.logout();
  req.session.destroy((err) => {
    if (err !== undefined) {
      console.error(err);
      return next(err);
    }
    res.clearCookie("connect.sid");
    res.status(200).send({ success: true });
  });
};

export const jwtLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;
  if (!email || !password) {
    const error = new Error("email and password are required");
    return next(error);
  }
  const user: IUserDocument | null = await User.findOne({ email }).select(
    "_id email username"
  );
  if (user === null) {
    const error = new Error("not found user");
    return next(error);
  }
  const result: boolean = await bcrypt.compare(password, user.password);
  if (result) {
    // JWT Payload 생성
    const payload = {
      id: user._id,
      email,
    };
    // JWT Token 생성
    jwt.sign(
      payload,
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRATION },
      (err, token) => {
        res.send({
          success: true,
          token,
        });
      }
    );
  } else {
    const error = new Error("Passwords do not match.");
    return next(error);
  }
};

export const jwtAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate(
    "jwt",
    { session: false },
    (serverError, user, clientError) => {
      if (serverError) {
        return next(serverError);
      }
      if (clientError) {
        return next(clientError);
      }
      if (user) {
        req.user = user;
        next();
      }
    }
  )(req, res, next);
};

// jwtAccess -> onlyPrivate or onlyPublic

export const onlyPrivate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(401).send({ success: false, message: "only private access" });
  }
};

export const onlyPublic = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    next();
  } else {
    res.status(401).send({ success: false, message: "only public access" });
  }
};
