const express= require('express')
const shopRouter= express.Router()
const { createEditShop, getMyShop, getShopByCity } = require('../controllers/shop.controller.js')
const isAuth = require('../middleware/isAuth.middleware.js')
const upload = require('../middleware/multer.middleware.js')

shopRouter.post('/create-edit',isAuth,upload.single('image'),createEditShop)
shopRouter.get('/get-my',isAuth,getMyShop)
shopRouter.get('/get-by-city/:city',isAuth,getShopByCity)

module.exports= shopRouter