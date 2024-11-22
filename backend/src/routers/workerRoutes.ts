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
              message:"You dont have anymore tasks to review"
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

router.post("/payout", workerMiddleware, async (req, res) => {
  // @ts-ignore
  const userId: string = req.userId;
  const worker = await prismaClient.worker.findFirst({
      where: { id: Number(userId) }
  })

  if (!worker) {
      return res.status(403).json({
          message: "User not found"
      })
  }

  const transaction = new Transaction().add(
      SystemProgram.transfer({
          fromPubkey: new PublicKey("2KeovpYvrgpziaDsq8nbNMP4mc48VNBVXb5arbqrg9Cq"),
          toPubkey: new PublicKey(worker.address),
          lamports: 1000_000_000 * worker.pending_amount / TOTAL_DECIMALS,
      })
  );


  console.log(worker.address);

  const keypair = Keypair.fromSecretKey(decode(privateKey));

  // TODO: There's a double spending problem here
  // The user can request the withdrawal multiple times
  // Can u figure out a way to fix it?
  let signature = "";
  try {
      signature = await sendAndConfirmTransaction(
          connection,
          transaction,
          [keypair],
      );
  
   } catch(e) {
      return res.json({
          message: "Transaction failed"
      })
   }
  
  console.log(signature)

  // We should add a lock here
  await prismaClient.$transaction(async tx => {
      await tx.worker.update({
          where: {
              id: Number(userId)
          },
          data: {
              pending_amount: {
                  decrement: worker.pending_amount
              },
              locked_amount: {
                  increment: worker.pending_amount
              }
          }
      })

      await tx.payouts.create({
          data: {
              user_id: Number(userId),
              amount: worker.pending_amount,
              status: "Processing",
              signature: signature
          }
      })
  })

  res.json({
      message: "Processing payout",
      amount: worker.pending_amount
  })


})

export default router;
