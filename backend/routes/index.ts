import express, { Request, Response, NextFunction } from "express";
import { getDrafts, readMail, getMails, createLabel, getLabel } from "../controllers/message.controller";
import { sendMailViaQueue, sendMultipleEmails } from "../controllers/queue.controller";
import { redisGetToken } from "../middlewares/redis.middleware";
import { sendMail, getUser } from "./authGoogle";

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Middleware for error handling
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Route definitions
router.get("/userInfo/:email", asyncHandler(getUser));

router.post("/sendMail/:email", asyncHandler(async (req: Request, res: Response) => {
  const token = await redisGetToken(req.params.email) || "";
  const result = await sendMail(req.body, token);
  res.status(200).json({ message: "Email sent successfully", result });
}));

router.get("/allDrafts/:email", asyncHandler(getDrafts));
router.get("/read/:email/message/:message", asyncHandler(readMail));
router.get("/list/:email", asyncHandler(getMails));

router.post("/sendone/:email/:id", asyncHandler(sendMailViaQueue));
router.post("/sendMultiple/:id", asyncHandler(sendMultipleEmails));
router.post("/createLabel/:email", asyncHandler(createLabel));
router.get("/getLabel/:email/:id", asyncHandler(getLabel));

export default router;
