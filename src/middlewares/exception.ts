import * as express from "express";
import HttpException from "../global/HttpException";

const exception = (
  err: HttpException,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  console.error(err);
  res.status(404).send({ status: false, error: err.message });
};

export default exception;
