import * as bcrypt from "bcrypt";
import * as passport from "passport";
import { IStrategyOptions, Strategy, VerifyFunction } from "passport-local";
import User from "../schema/User";

const options: IStrategyOptions = {
  usernameField: "email",
  passwordField: "password",
};

const verify: VerifyFunction = async (email, password, done) => {
  try {
    const user = await User.findOne({ email });
    if (user !== null) {
      const result: boolean = await bcrypt.compare(password, user.password);
      if (result) {
        return done(null, user);
      } else {
        return done(null, false, { message: "bad password" });
      }
    } else {
      // server error, success, client error
      return done(null, false, {
        message: "Please check your email and password.",
      });
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
