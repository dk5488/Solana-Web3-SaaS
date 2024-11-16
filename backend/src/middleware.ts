import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
const JWT_SECRET = "Divy123";
import { WORKER_JWT_SECRET } from "./routers/workerRoutes";

export function authMiddleware(req: Request,res: Response,next: NextFunction) {

  const header = req.headers["authorization"] ?? "";

  try {
    const decrypt = jwt.verify(header, JWT_SECRET);
    //@ts-ignore
    if (decrypt.userId) {
        //@ts-ignore
      req.userId = decrypt.userId;

      return next();

    } else {

      return res.status(403).json({
        message: "User Not logged in",
      });

    }
  } catch (error) {

    return res.status(403).json({
      message: "User Not logged in please try again",
    });

  }
}


export function workerMiddleware(req: Request,res: Response,next: NextFunction) {

  const header = req.headers["authorization"] ?? "";

  try {
    const decrypt = jwt.verify(header, WORKER_JWT_SECRET);
    //@ts-ignore
    if (decrypt.userId) {
        //@ts-ignore
      req.userId = decrypt.userId;

      return next();

    } else {

      return res.status(403).json({
        message: "User Not logged in",
      });

    }
  } catch (error) {

    return res.status(403).json({
      message: "User Not logged in please try again",
    });

  }
}

