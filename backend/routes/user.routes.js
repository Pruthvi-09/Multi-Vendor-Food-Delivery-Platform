const express= require('express')
const userRouter= express.Router()
const isAuth = require('../middleware/isAuth.middleware.js')
const { updateUserLocation, getCurrentUser } = require('../controllers/user.controller.js')

userRouter.get('/current',isAuth,getCurrentUser)
userRouter.post('/update-location',isAuth,updateUserLocation)

module.exports= userRouter