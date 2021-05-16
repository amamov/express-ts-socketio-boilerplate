import * as express from "express";
import { Express, Request, Response } from "express";

const app: Express = express();

app.set("port", 5000);

app.get("/", (req: Request, res: Response) => {
  res.send("hello world!!");
});

app.listen(app.get("port"), () => {
  console.log("http://localhost:5000");
});
