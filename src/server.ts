import "./global";
import config from "./global/env";
import * as express from "express";
import * as http from "http";
import * as path from "path";
import * as cors from "cors";
import * as hpp from "hpp";
import * as helmet from "helmet";
import * as morgan from "morgan";
import * as mongoose from "mongoose";
import * as cookieParser from "cookie-parser";
import * as session from "express-session";
import * as redisConnector from "connect-redis";
import * as redis from "redis";
import * as passport from "passport";
import passportConfig from "./passport";
import indexRoute from "./routes/index";
import usersRoute from "./routes/users";
import exception from "./middlewares/exception";
import notFound from "./middlewares/notFound";

class Server extends http.Server {
  public app: express.Application;

  constructor() {
    const app: express.Application = express();
    super(app);
    this.app = app;
  }

  private setPassport() {
    passportConfig();
    this.app.use(passport.initialize());
    this.app.use(passport.session());
  }

  private async setDatabase() {
    const mongodbOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    };
    try {
      await mongoose.connect(config.MONGO_URL, mongodbOptions);
      if (config.PRODUCTION) {
        mongoose.set("debug", true);
      }
      console.log("✅ Connected to DB");
    } catch (err) {
      console.log(`❌ Error on DB Connection:${err}`);
    }
  }

  private setRouter() {
    this.app.use("/", indexRoute);
    this.app.use("/users", usersRoute);
    this.app.use(notFound);
    this.app.use(exception);
  }

  private setMiddleware() {
    if (config.PRODUCTION) {
      this.app.use(hpp());
      this.app.use(helmet());
      this.app.use(morgan("combined"));
      this.app.use(
        cors({
          origin: /amamov\.co$/,
          credentials: true,
        })
      );
      const RedisStore = redisConnector(session);
      const redisClient = redis.createClient({
        url: `redis://${config.REDIS_HOST}:${config.REDIS_PORT}`,
        password: config.REDIS_PASSWORD,
      });
      redisClient.on("error", (error) => {
        console.error(error);
      });
      this.app.use(
        session({
          resave: false,
          saveUninitialized: false,
          secret: config.COOKIE_SECRET,
          cookie: {
            httpOnly: true,
            secure: true,
          },
          name: "sid",
          store: new RedisStore({ client: redisClient, logErrors: true }),
        })
      );
    } else {
      this.app.use(morgan("dev"));
      // res.setHeader("Access-Control-Allow-Origin", "http://client.co")
      this.app.use(
        cors({
          origin: true,
          credentials: true,
        })
      );
      this.app.use(
        session({
          resave: false,
          saveUninitialized: false,
          secret: config.COOKIE_SECRET,
          cookie: {
            httpOnly: true,
            secure: false,
          },
          name: "sid",
        })
      );
    }

    this.app.use("/static", express.static(path.join(__dirname, "assets")));
    this.app.use("/media", express.static(path.join(__dirname, "uploads")));
    this.app.use(cookieParser(config.COOKIE_SECRET));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.setPassport();
    this.setRouter();
  }

  async start() {
    this.app.set("port", config.PORT);
    this.setDatabase();
    this.setMiddleware();
    return this.app.listen(this.app.get("port"), () => {
      console.log(`server : http://localhost:${this.app.get("port")}`);
    });
  }
}

export default Server;
