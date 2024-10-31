import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { authMiddleware } from "../middleware";

const router = Router();
const prismaClient = new PrismaClient();
const JWT_SECRET = "Divy123";



export default router;
