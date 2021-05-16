import * as dotenv from "dotenv";
dotenv.config({ path: `${__dirname}/../../.env` });

import * as http from "http";
import * as path from "path";
import * as express from "express";
import * as morgan from "morgan";
import * as cors from "cors";
import * as cookieParser from "cookie-parser";
import * as session from "express-session";
import * as hpp from "hpp";
import * as passport from "passport";
import * as helmet from "helmet";
import indexRoute from "./routes/index";

const prod: boolean = process.env.NODE_ENV === "production";

class HttpException extends Error {
  public status: number;
  public message: string;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.message = message;
  }
}

class Server extends http.Server {
  public app: express.Application;

  constructor() {
    const app: express.Application = express();
    super(app);
    this.app = app;
  }

  private setAuth() {
    const SECRET: string = process.env.COOKIE_SECRET || "";
    this.app.use(cookieParser(SECRET));
    this.app.use(
      session({
        resave: false,
        saveUninitialized: false,
        secret: SECRET,
        cookie: {
          httpOnly: true,
          secure: false, // https -> true
          domain: prod ? ".amamov.co" : undefined,
        },
        name: "se",
      })
    );
    this.app.use(passport.initialize());
    this.app.use(passport.session());
  }

  private setDatabase() {}

  private setRouter() {
    this.app.use("/", indexRoute);
  }

  private setMiddleware() {
    if (prod) {
      this.app.use(hpp());
      this.app.use(helmet());
      this.app.use(morgan("combined"));
      this.app.use(
        cors({
          origin: /amamov\.co$/,
          credentials: true,
        })
      );
    } else {
      this.app.use(morgan("dev"));
      this.app.use(
        cors({
          origin: true,
          credentials: true,
        })
      );
    }
    this.app.use("/", express.static(path.join(__dirname, "uploads")));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.setAuth();

    this.setRouter();

    // 404
    this.app.use(
      (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        const error = new Error(`Not found ${req.method} ${req.url} `);
        const exception: HttpException = new HttpException(404, error.message);
        next(exception);
      }
    );

    // exception middleware
    this.app.use(
      (
        err: HttpException,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        console.error(err);
        res.locals.error = process.env.NODE_ENV !== "production" ? err : {};
        res.send(`${err.status} : ${err.message}`);
      }
    );
  }

  async start() {
    this.app.set("port", process.env.PORT || 5000);
    this.setDatabase();
    this.setMiddleware();
    this.app.listen(this.app.get("port"), () => {
      console.log(`server : http://localhost:${this.app.get("port")}`);
    });
  }
}

export default Server;
