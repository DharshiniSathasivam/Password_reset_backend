const express=require('express')
const router=express.Router();
const crypto=require('crypto')
const bcrypt = require('bcryptjs');

const User=require('../models/User')

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.create({ name, email, password });
    res.json({ message: 'Account created successfully', user });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Email not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

    res.json({ message: 'Login successful', userId: user._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/forgot-password',async(req,res)=>{
    try{
        const{email}=req.body;
        const user=await User.findOne({email});

        if(!user){
            return res.status(404).json({message:'Email not Found'})
        }
        const token=crypto.randomBytes(32).toString('hex');

        user.resetToken=token;
        user.resetTokenExpiry=Date.now()+3600000;
        await user.save();

        const restLink=`http://localhost:5173/reset/${token}`;

        console.log('rest link:',restLink)

        res.json({message:'Reset link sent to email',restLink})
    }
     catch(err){
        console.log(err)
        res.status(500).json({message:'server error'})
     }
})

router.post('/reset-password/:token',async(req,res)=>{
    try{
        const{token}=req.params;
        const{password}=req.body;

        const user=await User.findOne({
            resetToken:token,
            resetTokenExpiry:{$gt:Date.now()},
        })
        if(!user){
            return res.status(400).json({
                message:'Invalid or expired reset token',
            })
        }
        user.password=password;

        user.resetToken=undefined;
        user.resetTokenExpiry=undefined;

        await user.save();

        res.json({message:'password reset successful'})
    }catch(err){
        console.log(err);
        res.status(500).json({message:'server error'})
    }
})

module.exports=router;