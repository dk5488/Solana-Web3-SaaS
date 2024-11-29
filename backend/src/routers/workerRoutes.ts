import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { authMiddleware, workerMiddleware } from "../middleware";

const router = Router();
const prismaClient = new PrismaClient();
import { WORKER_JWT_SECRET } from "../config";

//@ts-ignore

router.post("/signin",async(req,res)=>{
    try {
        const walletAddress = "HijWBNXaHo76YvRwQLHwwQ4RwRLdbYagjwUQyE6Any7u";
        const existingWorker = await prismaClient.worker.findFirst({
          where: {
            address: walletAddress,
          },
        });
    
        if (existingWorker) {
          const token = jwt.sign(
            {
              userId: existingWorker.id,
            },
            WORKER_JWT_SECRET
          );
     
          res.json({ token });
        } else {
          const worker = await prismaClient.worker.create({
            data: {
              address: walletAddress,
              pending_amount:0,
              locked_amount:0
            },
          });
    
          const token = jwt.sign(
            {
              userId: worker.id,
            },
            WORKER_JWT_SECRET
          );
    
          res.json({ token });
        }
      } catch (error) {
        console.error("Error during signin:", error);
        res.status(500).json({ message: "Error during signin" });
      }
})

//@ts-ignore
router.get("/nextTask",workerMiddleware,async(req,res)=>{
  //@ts-ignore
  const userId=req.userId;

  try {
      const task=await prismaClient.task.findFirst({
          where:{
              done:false,
              submissions:{
                  none:{
                      worker_id:userId,
                      
                  }
              }
          },

          select:{
              title:true,
              options:true
          }
      })
  
      if(!task){
          return res.status(411).json({
              message:"You dont have anymore tasks to review complete more tasks"
          })
      }
      else{
          return res.status(200).json({
              task
          })
      }
  } catch (error) {
      console.log("Error getting next task ",error)
  }

  
})


router.get("/balance", workerMiddleware, async (req, res) => {
  // @ts-ignore
  const userId: string = req.userId;

  const worker = await prismaClient.worker.findFirst({
      where: {
          id: Number(userId)
      }
  })

  res.json({
      pendingAmount: worker?.pending_amount,
      lockedAmount: worker?.pending_amount,
  })
})


export default router;
