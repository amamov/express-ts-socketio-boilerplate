import * as express from "express";
import HttpException from "../global/HttpException";

const notFound = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const exception: HttpException = new HttpException(
    404,
    `Not found ${req.method} ${req.url} `
  );
  next(exception);
};

export default notFound;
