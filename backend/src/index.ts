import express from "express"
const app=express();
import userRoutes from 
app.use('api/v1/user',userRoutes);
app.use('api/v1/worker',workerRoutes);