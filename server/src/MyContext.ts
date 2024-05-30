import express from "express";

export interface MyContext {
  req: express.Request;
  res: express.Response;
  payload?: { userId: string };
}
