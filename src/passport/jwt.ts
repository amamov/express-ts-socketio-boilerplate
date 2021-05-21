import * as passport from "passport";
import {
  Strategy,
  ExtractJwt,
  StrategyOptions,
  VerifyCallback,
} from "passport-jwt";
import User, { IUserDocument } from "../schema/User";
import config from "../global/env";

const options: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.JWT_SECRET,
};

const verify: VerifyCallback = async (payload, done) => {
  try {
    const user: IUserDocument | null = await User.findById(payload.id);
    if (user !== null) {
      return done(null, user);
    } else {
      return done(null, false, { message: "not found user" });
    }
  } catch (error) {
    console.error(error);
    return done(error);
  }
};

//* login 전략
export default () => {
  passport.use(new Strategy(options, verify));
};
