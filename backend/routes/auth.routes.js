const express= require('express')
const { signIn, signUp, signOut, sendOtp, verifyOtp, resetPassword, googleAuth } = require('../controllers/auth.controller')
const authRouter= express.Router()

authRouter.post('/signin',signIn)
authRouter.post('/signup',signUp)
authRouter.get('/signout',signOut)

authRouter.post('/send-otp',sendOtp)
authRouter.post('/verify-otp',verifyOtp)
authRouter.post('/reset-password',resetPassword)
authRouter.post('/google-auth',googleAuth)

module.exports= authRouter