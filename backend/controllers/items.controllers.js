const Item = require('../models/item.model.js');
const Shop = require('../models/shop.model.js');
const uploadOnCloudinary = require('../utils/cloudinary.js')
const Rating = require('../models/rating.model.js')

//------------------------------------- add item-----------------------------
const addItem=async (req,res)=>{
    try {

        const{name,category, foodType,price}=req.body
        let image;
        if(req.file){
            const result = await uploadOnCloudinary(req.file.path)
            image = result.secure_url
        }
        const shop= await Shop.findOne({owner:req.userId})
        if(!shop){
           return res.status(400).json({message:"shop not found"})
        }
        const item= await Item.create({
            name,category, foodType,price, image,shop:shop._id
        })

        // Add item to shop's items array
        shop.items.push(item._id)
        await shop.save()
        await shop.populate('owner')
        await shop.populate({
            path:'items',
            options:{sort:{updatedAt:-1}}
        })
        return res.status(201).json(shop)
        
    } catch (error) {
        console.error("Add item error:", error)
        return res.status(500).json({message:`add item error ${error.message}`})
    }
}

//--------------------------------- edit item-----------------------------
const editItem= async( req,res)=>{
    try {
        
        const itemId= req.params.itemId
        
        const{name,category, foodType,price}=req.body
        
        const updateData = {name, category, foodType, price}
        
        if(req.file){
            const result = await uploadOnCloudinary(req.file.path)
            updateData.image = result.secure_url
        }
        
        const item= await Item.findByIdAndUpdate(itemId, updateData, {new:true})

        if(!item){
            return res.status(400).json({message:"item not found"})
        }

        const shop = await Shop.findOne({owner:req.userId}).populate({
            path:'items',
            options:{sort:{updatedAt:-1}}
        })
        return res.status(200).json(shop)

    } catch (error) {
        console.error("Update item error:", error)
        return res.status(500).json({message:`update item error ${error.message}`})
    }
}

// --------------------- get item by id ------------------------
 const getItemById=async(req,res)=>{
    try {
          const itemId= req.params.itemId
          const item = await Item.findById(itemId)
          if(!item){
              return res.status(400).json({message:"item not found"})
          }
           return res.status(200).json(item)
        
    } catch (error) {
        console.error("getItemById  error:", error)
        return res.status(500).json({message:`getItemById  error ${error.message}`})
    }
 }

 //--------------------------- delete item----------------------------
 
 const deleteItem=async(req, res)=>{
    try {
        const itemId= req.params.itemId
        const item = await Item.findByIdAndDelete(itemId)
         if(!item){
              return res.status(400).json({message:"item not found"})
          }
          const shop = await Shop.findOne({owner:req.userId})
          // Remove item from shop's items array
          shop.items = shop.items.filter(i => i.toString() !== itemId.toString())
          await shop.save()
          
          return res.status(200).json({message: "Item deleted successfully", itemId})

    } catch (error) {
        console.error("Delete item error:", error)
        return res.status(500).json({message:`delete Item error ${error.message}`})
    }
 }

 //--------------------------get item of our city------------------------------------
 const getItemByCity=async(req,res)=>{
    try {
        const {city}=req.params
        if(!city){
              return res.status(400).json({message:"city not found"})
          }
           const shops=await Shop.find({
                   city:{$regex:new RegExp(`^${city}$`,"i")}
                }).populate('items')
          
                if(!shops || shops.length === 0){
                   return res.status(404).json({message:'No shops found in this city'})
                }
                const shopIds=shops.map((shop)=>shop._id)
                const items=await Item.find({shop:{$in:shopIds}})
                return res.status(200).json(items)


    } catch (error) {
        return res.status(500).json(error)
        
    }

 }

 //--------------- get Items by Shop-----------------------

 const getItemsByShop=async(req,res)=>{
    try {
        const {shopId}=req.params
        const shop=await Shop.findById(shopId).populate('items')
        if(!shop){
            return res.status(400).json('shop not found')
        }

        return res.status(200).json({
            shop,items:shop.items
        })
        
    } catch (error) {
        return res.status(500).json({message:`get Items by shop error ${error.message}`})

    }

 }


 //------------------ Search Items-----------------------------

 const searchItems=async(req,res)=>{
    try {
        const{query,city}=req.query
        if(!query || !city){
            return null
        }
        // find a shop
        const shops=await Shop.find({
         city:{$regex:new RegExp(`^${city}$`,"i")}
      }).populate('items')

      if(!shops || shops.length === 0){
         return res.status(404).json({message:'No shops found in this city'})
      }

      const shopIds=shops.map(s=>s._id)
      const items=await Item.find({
        shop:{$in:shopIds},
        $or:[
            {name:{$regex:query, $options:'i'}},
            {category:{$regex:query, $options:'i'}},   
        ]
      }).populate('shop', 'name image')

      return res.status(200).json(items)
        
    } catch (error) {
                return res.status(500).json({message:`seach Items error ${error.message}`})
  
    }
 }
  //---------------------  Ratings -----------------------------

  const rating=async(req,res)=>{
    try {
        const {itemId,rating}=req.body
        const userId=req.userId

        if(!itemId || !rating){
            return res.status(400).json({message:'ItemId and rating is required'})
        }

        if( rating<1 || rating>5){
            return res.status(400).json({message:'rating must be between 1 to 5'})
        }

        const item=await Item.findById(itemId)
        if(!item){
           return res.status(400).json({message:'item not found'})
        }

        // Check if user has already rated this item
        const existingRating = await Rating.findOne({ user: userId, item: itemId })

        if(existingRating){
            // User is updating their rating
            const oldRating = existingRating.rating
            
            // Update the rating document
            existingRating.rating = rating
            await existingRating.save()

            // Recalculate the average (remove old rating, add new rating)
            const newAverage = (item.rating.average * item.rating.count - oldRating + rating) / item.rating.count
            item.rating.average = newAverage
            await item.save()

            return res.status(200).json({
                rating: item.rating,
                message: 'Rating updated successfully',
                userRating: rating
            })
        } else {
            // User is rating for the first time
            // Create new rating document
            await Rating.create({
                user: userId,
                item: itemId,
                rating: rating
            })

            // Update item rating
            const newCount = item.rating.count + 1
            const newAverage = (item.rating.average * item.rating.count + rating) / newCount

            item.rating.count = newCount
            item.rating.average = newAverage
            await item.save()

            return res.status(200).json({
                rating: item.rating,
                message: 'Rating submitted successfully',
                userRating: rating
            })
        }
    } catch (error) {
       return res.status(500).json({message:`item rating error ${error.message}`})
    }
  }

  // Get user's rating for items
  const getUserRatings = async(req, res) => {
    try {
        const userId = req.userId
        const { itemIds } = req.body

        if(!itemIds || !Array.isArray(itemIds)) {
            return res.status(400).json({message: 'itemIds array is required'})
        }

        const ratings = await Rating.find({
            user: userId,
            item: { $in: itemIds }
        })

        // Convert to object map for easy lookup
        const ratingsMap = {}
        ratings.forEach(r => {
            ratingsMap[r.item.toString()] = r.rating
        })

        return res.status(200).json(ratingsMap)
    } catch (error) {
        return res.status(500).json({message: `get user ratings error ${error.message}`})
    }
  }

module.exports={addItem, editItem, getItemById, deleteItem,
    getItemByCity,getItemsByShop,searchItems,rating,getUserRatings}