import { Request, Response, Router } from "express";
import { RtcTokenBuilder, RtcRole } from "agora-access-token";

const router = Router();

const APP_ID = process.env.APP_ID!;
const APP_CERTIFICATE = process.env.APP_CERTIFICATE!;
console.log("APP_ID:", process.env.APP_ID);
console.log("APP_CERTIFICATE:", process.env.APP_CERTIFICATE);
router.get("/", (req: Request, res: Response) => {
  const channelName = req.query.channel as string;
  const uid = Number(req.query.uid) || 0;

  if (!channelName) {
    return res.status(400).json({ error: "Channel is required" });
  }

  const role = RtcRole.PUBLISHER;

  const expireTime = 3600; // 1 hour
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;

  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channelName,
    uid,
    role,
    privilegeExpireTime
  );

  return res.json({
    token,
    uid,
    channel: channelName,
  });
});

export default router;