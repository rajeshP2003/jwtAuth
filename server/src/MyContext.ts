import express from "express";

export interface MyContext {
  req: express.Request;
  res: express.Response;
  payload?: { userId: string; tokenVersion: number };
  // payload?: { userId: string; tokenVersion: string };
}
