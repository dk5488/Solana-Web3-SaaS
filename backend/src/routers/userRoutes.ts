import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { authMiddleware } from "../middleware";

const router = Router();
const prismaClient = new PrismaClient();
const JWT_SECRET = "Divy123";

const s3Client = new S3Client({
  credentials: {
    accessKeyId: "AKIAZAI4HGLC6EBGAA6T",
    secretAccessKey: "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",
  },
  region: "eu-north-1",
});

//@ts-ignore
router.post("/task", authMiddleware, async (req, res) => {
  //@ts-ignore
  const userId = req.userId
  // validate the inputs from the user;
  const body = req.body;

  const parseData = createTaskInput.safeParse(body);

  const user = await prismaClient.user.findFirst({
      where: {
          id: userId
      }
  })

  if (!parseData.success) {
      return res.status(411).json({
          message: "You've sent the wrong inputs"
      })
  }

  const transaction = await connection.getTransaction(parseData.data.signature, {
      maxSupportedTransactionVersion: 1
  });

  console.log(transaction);

  if ((transaction?.meta?.postBalances[1] ?? 0) - (transaction?.meta?.preBalances[1] ?? 0) !== 100000000) {
      return res.status(411).json({
          message: "Transaction signature/amount incorrect"
      })
  }

  if (transaction?.transaction.message.getAccountKeys().get(1)?.toString() !== PARENT_WALLET_ADDRESS) {
      return res.status(411).json({
          message: "Transaction sent to wrong address"
      })
  }

  if (transaction?.transaction.message.getAccountKeys().get(0)?.toString() !== user?.address) {
      return res.status(411).json({
          message: "Transaction sent to wrong address"
      })
  }
  // was this money paid by this user address or a different address?

  // parse the signature here to ensure the person has paid 0.1 SOL
  // const transaction = Transaction.from(parseData.data.signature);

  let response = await prismaClient.$transaction(async tx => {

      const response = await tx.task.create({
          data: {
              title: parseData.data.title ?? DEFAULT_TITLE,
              amount: 0.1 * TOTAL_DECIMALS,
              //TODO: Signature should be unique in the table else people can reuse a signature
              signature: parseData.data.signature,
              user_id: userId
          }
      });

      await tx.option.createMany({
          data: parseData.data.options.map(x => ({
              image_url: x.imageUrl,
              task_id: response.id
          }))
      })

      return response;

  })

  res.json({
      id: response.id
  })

})

//@ts-ignore
router.get("/presignedUrl", authMiddleware, async (req, res) => {
    //@ts-ignore
  const userId=req.userId
  


  const { url, fields } = await createPresignedPost(s3Client, {
    Bucket: 'decentralized-5r',
    Key: `/fiver/${userId}/${Math.random()}/image.jpg`,
    Conditions: [
      ['content-length-range', 0, 5 * 1024 * 1024] // 5 MB max
    ],
    Fields: {
      success_action_status: '201',
      'Content-Type': 'image/png'
    },
    Expires: 3600
  })
  
  console.log({ url, fields })

  
  res.json({
    preSignedUrl:url,
    fields
  })


});

router.post("/signin", async (req, res) => {
  try {
    const walletAddress = "HijWBNXaHo76YvRwQLHwwQ4RwRLdbYagjwUQyE6Any7u";
    const existingUser = await prismaClient.user.findFirst({
      where: {
        address: walletAddress,
      },
    });

    if (existingUser) {
      const token = jwt.sign(
        {
          userId: existingUser.id,
        },
        JWT_SECRET
      );

      res.json({ token });
    } else {
      const user = await prismaClient.user.create({
        data: {
          address: walletAddress,
        },
      });

      const token = jwt.sign(
        {
          userId: user.id,
        },
        JWT_SECRET
      );

      res.json({ token });
    }
  } catch (error) {
    console.error("Error during signin:", error);
    res.status(500).json({ message: "Error during signin" });
  }
});

export default router;
