
const express=require('express');
const mongoose=require('mongoose');
const app=express()
require("dotenv").config()
const authRoutes=require('./routes/auth')

app.use(express.json())

const PORT=process.env.PORT || 5000;
const MONGO_URI = "mongodb://localhost:27017/password_rest_backend";


mongoose.connect(MONGO_URI)
  .then(()=>{
    console.log('MongoDB connected');
    app.listen(PORT,()=>{
        console.log(`server on port ${PORT}`)
    })
  })
  .catch((err)=>{
     console.log('DB connection failed:',err)
  })

app.get('/',(req,res)=>{
    res.json({message:'server is running'})
});

app.use('/api/auth',authRoutes)