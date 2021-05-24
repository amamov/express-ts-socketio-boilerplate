import { Router } from "express";
import { jwtAccess, onlyPrivate, onlyPublic } from "../controller/auth";

const router = Router();

router.get("/", (req, res) => {
  res.send({ hello: "world" });
});

router.get("/favicon.ico", (req, res) => {
  res.status(200).send("favicon");
});

router.get("/test/jwt", jwtAccess, (req, res) => {
  console.log(req.user);
  res.send({ status: true, message: "success token access" });
});

router.get("/test/private", onlyPrivate, (req, res) => {
  console.log(req.user);
  res.send({ status: true, message: "private" });
});

router.get("/test/public", onlyPublic, (req, res) => {
  console.log(req.user);
  res.send({ status: true, message: "public" });
});

export default router;
