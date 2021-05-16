import * as passport from "passport";

export default () => {
  passport.serializeUser((user, done) => {}); // login할 때 한 번 실행된다.
  passport.deserializeUser(() => {}); // login할 때 한 번 실행된다.
};
