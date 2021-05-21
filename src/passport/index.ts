import * as passport from "passport";
import localPassport from "./local";
import jwtPassport from "./jwt";
import User, { IUserDocument } from "../schema/User";

const config = () => {
  passport.serializeUser((user: IUserDocument, done) => {
    // req.login(user, ...)시에 실행
    // serialization은 어떤 정보를 쿠키에게 주느냐를 의미
    // 웹브라우저에 있는 사용자가 어떤 정보를 가질 수 있는지를 물어보는 것
    // 우리는 User.createStrategy()를 생성하여 User 정보를 줄 수 있음
    // 웹브라우저 쿠키에 user.id만 담아서 보내도록 하는 코드
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    // serialize에서 웹 브라우저 쿠키에 user.id를 주었을 때 deserialize는
    // 그 쿠키의 정보를 사용자로 전환하는 것. 정보를 복구해서 req.user에 저장한다.
    try {
      const user: IUserDocument | null = await User.findById(id);
      done(null, user);
    } catch (error) {
      console.error(error);
      done(error);
    }
  });

  localPassport();
  jwtPassport();
};

export default config;
