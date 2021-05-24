//* /users/

import { Router } from "express";
import { uploadAvatar } from "../middlewares/upload";
import {
  jwtLogin,
  localLogin,
  logout,
  onlyPrivate,
  onlyPublic,
} from "../controller/auth";
import { allUser, me, signup } from "../controller/users";

const router = Router();

//* test route
router.get("/", onlyPrivate, allUser);

//* me
router.get("/me", me);

//* signup
router.post("/", onlyPublic, signup);

//* login using session cookies
router.post("/login", onlyPublic, localLogin);

//* logout using session cookies
router.post("/logout", logout);

//* login using jwt authentication
router.post("/login/jwt", onlyPublic, jwtLogin);

router.post("/media/avatar", onlyPrivate, uploadAvatar, (req, res) => {
  console.log(req.file);
  res.send({ url: `/media/avatar/${req.file.filename}` });
});

export default router;
