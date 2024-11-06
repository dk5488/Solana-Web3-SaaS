import express from "express"
const app=express();

const PORT=3000;

import userRoutes from './routers/userRoutes'
import workerRoutes from './routers/workerRoutes'

app.use('/api/v1/worker',workerRoutes);
app.use('/api/v1/user',userRoutes);



app.get('/',(req,res)=>{
    res.json("Server is up on port 3000")
})

app.listen(3000,()=>{
    console.log("Server is running on port 3000");
})