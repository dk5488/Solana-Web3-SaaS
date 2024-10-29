import { PrismaClient } from "@prisma/client";
import {Router} from "express"
import jwt from "jsonwebtoken"

const router=Router();
const prismaClient=new PrismaClient();
const JWT_SECRET='Divy123';


router.post('/signin',async (req,res)=>{
    const walletAddress="HijWBNXaHo76YvRwQLHwwQ4RwRLdbYagjwUQyE6Any7u"
    const existingUser = await prismaClient.user.findFirst({
        where: {
            address: walletAddress
        }
    });


    if(existingUser){
        const token=jwt.sign({
            userId:existingUser.id
        },JWT_SECRET)

        res.json({token})
    }
    else{
        const user=await prismaClient.user.create({
            data:{
                address:walletAddress
            }
        })

        const token=jwt.sign({
            userId:user.id
        },JWT_SECRET)
        
    }
    


    
})

export default router;