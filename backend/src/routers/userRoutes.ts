import {Router} from "express"
import jwt from "jsonwebtoken"
const router=Router();
const JWT_SECRET='Divy123'; 

router.post('/signin',(req,res)=>{
    const user="HijWBNXaHo76YvRwQLHwwQ4RwRLdbYagjwUQyE6Any7u"

    const token=jwt.sign({
        address:user
    },JWT_SECRET);
})

export default router;