const express= require('express')
const { addItem, editItem, getItemById, deleteItem, getItemByCity, getItemsByShop, searchItems, rating, getUserRatings } = require('../controllers/items.controllers')
const isAuth = require('../middleware/isAuth.middleware.js')
const upload = require('../middleware/multer.middleware.js')
const itemRouter=express.Router()

itemRouter.post('/add-item',isAuth,upload.single('image'),addItem)
itemRouter.post('/edit-item/:itemId',isAuth,upload.single('image'),editItem)
itemRouter.get('/get-by-id/:itemId',isAuth,getItemById)
itemRouter.delete('/delete/:itemId',isAuth,deleteItem)
itemRouter.get('/get-by-city/:city',isAuth,getItemByCity)
itemRouter.get('/get-by-shop/:shopId',isAuth,getItemsByShop)
itemRouter.get('/search-items',isAuth,searchItems)
itemRouter.post('/rating',isAuth,rating)
itemRouter.post('/get-user-ratings',isAuth,getUserRatings)




module.exports=itemRouter