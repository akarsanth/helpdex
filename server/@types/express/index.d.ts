import { IUser } from "../../src/models/user-model";
import * as express from "express";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}
