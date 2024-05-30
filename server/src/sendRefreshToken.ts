import { Response } from "express";

// creating new refresh token and setting it on res.cookie
export const sendRefreshToken = (res: Response, token: string) => {
  res.cookie("jid", token, {
    httpOnly: true,
  });
};
