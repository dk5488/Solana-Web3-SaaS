import express from "express"
const app=express();

import userRoutes from './routers/userRoutes'
import workerRoutes from './routers/workerRoutes'

app.use('/api/v1/user',userRoutes);
app.use('/api/v1/worker',workerRoutes);


app.get('/',(req,res)=>{
    res.json("Server is up")
})

app.listen(3000,()=>{
    console.log("Server is running on port 3000");
})