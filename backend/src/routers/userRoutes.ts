import {Router} from "express"
import jwt from "jsonwebtoken"
const router=Router();

router.post('/signin',(req,res)=>{
    const user="HijWBNXaHo76YvRwQLHwwQ4RwRLdbYagjwUQyE6Any7u"

    const token=jwt.sign({
        address:user
    })
})

export default router;