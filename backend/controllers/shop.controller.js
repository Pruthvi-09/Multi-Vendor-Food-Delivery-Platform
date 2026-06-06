const uploadOnCloudinary = require('../utils/cloudinary.js')
const Shop = require('../models/shop.model.js')


// ---------------- create shop-------------------------
// const createEditShop= async(req, res)=>{
//     try {
        
//         const {name,city,state,address}=req.body
//         let image;
//         if(req.file){
//             console.log(req.file);
            
//             image=await uploadOnCloudinary(req.file.path)
//         }

//         let shop=await Shop.findOne({owner:req.userId}) // finds shop of perticular owner
//         //if shop is not available then it creates
//         if(!shop){
//            shop= await Shop.create({
//             name,city,state,address, image, owner:req.userId
//         })//if shop is available then he can update
//         }else{
//             shop= await Shop.findByIdAndUpdate(shop._id,{
//             name,city,state,address, image, owner:req.userId
//             },{new:true})
//         }

       
//         await shop.populate("owner")//Replace owner id with full owner data
//         return res.status(201).json(shop)
//     } catch (error) {
//  return res.status(500).json(` create shop error ${error} `)
        
//     }
// }
const createEditShop = async(req,res)=>{
   try {

      const {name,city,state,address} = req.body

      let shop = await Shop.findOne({owner:req.userId})

      let image;

      if(req.file){
         const result = await uploadOnCloudinary(req.file.path)
         image = result.secure_url
      }

      const shopData = {
         name,
         city,
         state,
         address,
         owner:req.userId
      }

      if(image){
         shopData.image = image
      }

      if(!shop){

         shop = await Shop.create(shopData)

      }else{

         shop = await Shop.findByIdAndUpdate(
            shop._id,
            shopData,
            {new:true}
         )

      }

      await shop.populate([
         { path: "owner" },
         { path: "items", options: { sort: { updatedAt: -1 } } }
      ])

      return res.status(201).json(shop)

   } catch(error){

      console.log(error)

      return res.status(500).json({
         message:`create shop error ${error.message}`
      })

   }
}

//--------------- get shop-----------------------

const getMyShop=async(req,res)=>{
    try {
        const shop= await Shop.findOne({owner:req.userId}).populate("owner").populate({
            path:'items',
            options:{sort:{updatedAt:-1}}
        })
        if(!shop){
            return res.status(404).json({message:'shop not found'})
        }
        return res.status(200).json(shop)
        
    } catch (error) {
         return res.status(500).json({message:`get my shop error ${error}`})
    }
}

const getShopByCity=async (req,res)=>{
   try {
      const {city}= req.params
      const shops=await Shop.find({
         city:{$regex:new RegExp(`^${city}$`,"i")}
      }).populate('items')

      if(!shops || shops.length === 0){
         return res.status(404).json({message:'No shops found in this city'})
      }
       return res.status(200).json(shops)

   } catch (error) {
      console.error("Get shop by city error:", error)
      return res.status(500).json({message:`get shop by city error ${error.message}`})
   }
}

module.exports={ createEditShop, getMyShop,getShopByCity }