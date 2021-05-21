import { IUserDocument } from "../schema/User";

declare global {
  namespace Express {
    interface User extends IUserDocument {}
  }
}

declare module "express-session" {
  export interface SessionData {
    user: { [key: string]: any };
    // code...
  }
}
