import { Router } from "express";

const router: Router = Router();

router.get("/", (req, res) => {
  res.json({ hello: "express!!" });
});

export default router;
