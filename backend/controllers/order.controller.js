const DeliveryAssignment = require("../models/deliveryAssignment.model")
const Order = require("../models/order.model")
const Shop = require("../models/shop.model")
const User = require("../models/user.model")
const { sendDeliveryOtpMail } = require("../utils/mail")
const Razorpay= require('razorpay')
const dotenv=require('dotenv')
dotenv.config()

let instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret:process.env.RAZORPAY_KEY_SECRET,
});

const getAvailableDeliveryBoysForOrder = async (order) => {
    try {
        const { longitude, latitude } = order.deliveryAddress || {};
        if (longitude === undefined || latitude === undefined) return [];

        const nearByDeliveryBoys = await User.find({
            role: 'deliveryBoy',
            location: {
               $near: {
                $geometry: { type: 'Point', coordinates: [Number(longitude), Number(latitude)] },
                $maxDistance: 5000 // 5km
               } 
            }
        });

        const nearByIds = nearByDeliveryBoys.map(b => b._id);
        const busyIds = await DeliveryAssignment.find({
            assignedTo: { $in: nearByIds },
            status: { $nin: ['broadcasted', 'completed'] }
        }).distinct('assignedTo');

        const busyIdSet = new Set(busyIds.map(id => String(id)));
        const availableBoys = nearByDeliveryBoys.filter(b => !busyIdSet.has(String(b._id)));

        return availableBoys.map(b => ({
            id: b._id,
            fullname: b.fullname,
            longitude: Array.isArray(b.location) ? b.location[0] : b.location?.coordinates?.[0],
            latitude: Array.isArray(b.location) ? b.location[1] : b.location?.coordinates?.[1],
            mobile: b.mobile
        }));
    } catch (error) {
        console.error("Error in getAvailableDeliveryBoysForOrder:", error);
        return [];
    }
};

// ----------------------------------------------------------------------place order----------------------------------------------------------------------

const placeOrder=async(req,res)=>{
    try {
        const{cartItems,paymentMethod,deliveryAddress,totalAmount}=req.body
        
        if(!cartItems || cartItems.length==0){
            return res.status(400).json({message:'cart is empty'})
        }

        if(!deliveryAddress || !deliveryAddress.text || !deliveryAddress.latitude || !deliveryAddress.longitude){
            return res.status(400).json({message:'send complete delivery address'})
        }

        // items are separated by diff. shops
        const groupItemsByShop={}

        cartItems.forEach(item=>{
            const shopId=item.shop
           if(!groupItemsByShop[shopId]){
                groupItemsByShop[shopId]=[]
           } 
           groupItemsByShop[shopId].push(item)
        })

        // -----------------------Shop Orders-------------------------------
        const shopOrders=await Promise.all( Object.keys(groupItemsByShop).map(async (shopId)=>{
            const shop=await Shop.findById(shopId).populate('owner')
            if(!shop){
                throw new Error('shop not found')
            }
            const items=groupItemsByShop[shopId]
            const subtotal=items.reduce((sum,i)=>sum+Number(i.price)*Number(i.quantity),0)

            return {
                shop:shop._id,
                owner:shop.owner._id,
                subtotal,
                shopOrderItems:items.map((i)=>({
                    items:i.id,
                    price:i.price,
                    quantity:i.quantity,
                    name:i.name
                }))
            
            }
        })
    )
//----------- online payment----------------
if(paymentMethod=='online'){
    const razorOrder=await instance.orders.create({
        amount:Math.round(totalAmount*100),
        currency:'INR',
        receipt:`receipt_${Date.now()}`
    })
     const newOrder= await Order.create({
        user:req.userId,
        paymentMethod,
        deliveryAddress,
        shopOrders,
        totalAmount,
        razorpayOrderId: razorOrder.id,
        payment:false
    })

    return res.status(200).json({
        razorOrder,
        orderId:newOrder._id,
    })
}

   //------------------------- new orders------------------------
    const newOrder= await Order.create({
        user:req.userId,
        paymentMethod,
        deliveryAddress,
        shopOrders,
        totalAmount

    })

    await newOrder.populate('shopOrders.shop','name')
    await newOrder.populate('shopOrders.owner','fullname socketId')
    await newOrder.populate('user','fullname email mobile')
    await newOrder.populate('shopOrders.shopOrderItems.items','name image price')


    //------- socket io execution---------
    const io=req.app.get('io')
    if(io){
        newOrder.shopOrders.forEach(shopOrder=>{
          const ownerSocketId=shopOrder.owner.socketId
          if(ownerSocketId){
            io.to(ownerSocketId).emit('newOrder',{
              _id:newOrder._id,
              paymentMethod:newOrder.paymentMethod,
              user:newOrder.user,
              shopOrders:[shopOrder],
              totalAmount:shopOrder?.subtotal || 0,
              createdAt:newOrder.createdAt,
              deliveryAddress:newOrder.deliveryAddress,
              payment:newOrder.payment
            })
          }
        })
    }

   return res.status(201).json(newOrder)

    } catch (error) {
        console.error("Place order error:", error)
       return res.status(500).json({message:`place order error ${error.message}`})
    }

}

//-------------------------------------------------------------------- verify payment--------------------------------------------------------------------------

const verifyPayment=async(req,res)=>{
    try {
        const {razorpay_payment_id,orderId}=req.body
        const payment=await instance.payments.fetch(razorpay_payment_id)
        if(!payment || payment.status!='captured'){
            return res.status(400).json({message:`payment not captured`})
        }

        const order=await Order.findById(orderId)
        if(!order){
          return res.status(400).json({message:`order not found `})
        }
        order.payment=true
        order.razorpayPaymentId=razorpay_payment_id
        await order.save()

         await order.populate('shopOrders.shop','name')
         await order.populate('shopOrders.owner','fullname socketId')
        await order.populate('user','fullname email mobile')
        await order.populate('shopOrders.shopOrderItems.items','name image price')


    //------- socket io execution---------
    const io=req.app.get('io')
    if(io){
        order.shopOrders.forEach(shopOrder=>{
          const ownerSocketId=shopOrder.owner.socketId
          if(ownerSocketId){
            io.to(ownerSocketId).emit('newOrder',{
              _id:order._id,
              paymentMethod:order.paymentMethod,
              user:order.user,
              shopOrders:[shopOrder],
              totalAmount:shopOrder?.subtotal || 0,
              createdAt:order.createdAt,
              deliveryAddress:order.deliveryAddress,
              payment:order.payment
            })
          }
        })
    }
        return res.status(200).json(order)
        
    } catch (error) {
         return res.status(500).json({message:`verify  order payment error ${error.message}`})

    }
}

//---------------------------------------------------------------------get user and owner orders-----------------------------------------------------------------


const getMyOrders=async(req,res)=>{
    try {
        console.log("Getting orders for user:", req.userId)
        const user=await User.findById(req.userId)
        
        if(!user){
            console.log("User not found")
            return res.status(404).json({message:'user not found'})
        }
        
        console.log("User role:", user.role)
        
        if(user.role=='user'){
            const orders=await Order.find({user:req.userId})
                .sort({ createdAt: -1 })
                .populate('shopOrders.shop',"name")
                .populate('shopOrders.owner','fullname email mobile')
                .populate('shopOrders.shopOrderItems.items','name image price')
            console.log("Found user orders:", orders.length)
            return res.status(200).json(orders)
        }
        else if(user.role=='owner'){
            const orders=await Order.find({"shopOrders.owner":req.userId})
                .sort({createdAt:-1})
                .populate('shopOrders.shop',"name")
                .populate('user','fullname email mobile')
                .populate('shopOrders.shopOrderItems.items','name image price')
                .populate('shopOrders.assignedDeliveryBoy','fullname mobile')
            console.log("Found owner orders:", orders.length)

            const filteredOrders = await Promise.all(orders.map(async (order) => {
                const ownerShopOrder = order.shopOrders.find(o => o.owner && o.owner.toString() === req.userId.toString());
                
                let availableBoys = [];
                if (ownerShopOrder && ownerShopOrder.status === 'out of delivery' && !ownerShopOrder.assignedDeliveryBoy) {
                    availableBoys = await getAvailableDeliveryBoysForOrder(order);
                }

                return {
                    _id: order._id,
                    paymentMethod: order.paymentMethod,
                    user: order.user,
                    shopOrders: [
                        {
                            ...ownerShopOrder.toObject(),
                            availableBoys
                        }
                    ],
                    totalAmount: ownerShopOrder?.subtotal || 0,
                    createdAt: order.createdAt,
                    deliveryAddress: order.deliveryAddress,
                    payment: order.payment
                };
            }));
            return res.status(200).json(filteredOrders)
        }
        else if(user.role=='deliveryBoy'){
            // Get all orders where this delivery boy delivered
            const orders = await Order.find({
                "shopOrders.assignedDeliveryBoy": req.userId,
                "shopOrders.status": "delivered"
            })
            .sort({createdAt: -1})
            .populate('shopOrders.shop', "name")
            .populate('user', 'fullname email mobile')
            .populate('shopOrders.shopOrderItems.items', 'name image price')
            
            console.log("Found delivery boy orders:", orders.length)
            
            // Filter to only show orders delivered by this delivery boy
            const deliveredOrders = orders.map(order => {
                const deliveredShopOrders = order.shopOrders.filter(
                    so => so.assignedDeliveryBoy && 
                    so.assignedDeliveryBoy.toString() === req.userId.toString() &&
                    so.status === 'delivered'
                )
                
                return {
                    _id: order._id,
                    paymentMethod: order.paymentMethod,
                    user: order.user,
                    shopOrders: deliveredShopOrders,
                    createdAt: order.createdAt,
                    deliveryAddress: order.deliveryAddress,
                    payment: order.payment
                }
            }).filter(order => order.shopOrders.length > 0) // Only include orders with delivered shop orders
            
            return res.status(200).json(deliveredOrders)
        }
        
        

    } catch (error) {
        console.error("Get my orders error:", error)
        res.status(500).json({message:`get user order error ${error.message}`})
    }
}


//------------------------------------------------ status updation---------------------------------------------------------------------

const updateOrderStatus=async(req,res)=>{
    try {
        const {orderId,shopId}=req.params
        const {status}=req.body
        
        console.log("Params:", {orderId, shopId, status});
        
        if(!shopId){
            return res.status(400).json({message:'shopId is required'})
        }
        
        const order= await Order.findById(orderId)
        
        if(!order){
            return res.status(404).json({message:'Order not found'})
        }
        
        const shopOrder= order.shopOrders.find(o=>o.shop && o.shop.toString()===shopId)
        if(!shopOrder){
            return res.status(400).json({message:'shop order not found'})
        }
        shopOrder.status=status

        let deliveryBoysPayload=[]
        //-----------------------finding delivery boys in 5 km area------------------------
        if(status=='out of delivery'){
            const availableBoys = await getAvailableDeliveryBoysForOrder(order);
            const candidates = availableBoys.map(b => b.id || b._id);

            if(candidates.length==0 && !shopOrder.assignment){
                await order.save()
                return res.json({
                    message:'status is updated but there is no delivery Boy available '
                })
            }

            let deliveryAssignment;
            if(!shopOrder.assignment){
                //------ assigning assignments-----------
                deliveryAssignment=await DeliveryAssignment.create({
                         order:order._id,
                         shop:shopOrder.shop,
                         shopOrderId:shopOrder._id,
                         broadcastedTo:candidates,
                         status:'broadcasted'
                })
                shopOrder.assignedDeliveryBoy=deliveryAssignment.assignedTo
                shopOrder.assignment=deliveryAssignment._id
            } else {
                // Update broadcastedTo list if assignment is still broadcasted
                deliveryAssignment = await DeliveryAssignment.findById(shopOrder.assignment)
                if (deliveryAssignment && deliveryAssignment.status === 'broadcasted') {
                    deliveryAssignment.broadcastedTo = candidates
                    await deliveryAssignment.save()
                }
            }

            deliveryBoysPayload = availableBoys;

            if (deliveryAssignment) {
              await deliveryAssignment.populate('order')
              await deliveryAssignment.populate('shop')

              const io= req.app.get('io')
              if(io){
                const availableBoysUsers = await User.find({ _id: { $in: candidates } });
                availableBoysUsers.forEach(boy => {
                    const boySocketId=boy.socketId
                    if(boySocketId){
                        io.to(boySocketId).emit('newAssignment',{
                                 sentTo:boy._id,
                                 sendTo:boy._id,
                                 assignmentId:deliveryAssignment._id,
                                 orderId:deliveryAssignment.order._id,
                                 shopName:deliveryAssignment.shop.name,
                                 deliveryAddress:deliveryAssignment.order.deliveryAddress,
                                 items:deliveryAssignment.order.shopOrders.find(so=>so._id.equals(deliveryAssignment.shopOrderId))?.shopOrderItems || [],
                                 subtotal:deliveryAssignment.order.shopOrders.find(so=>so._id.equals(deliveryAssignment.shopOrderId))?.subtotal

                        })
                    }
                })
              }
            }
        }

        await order.save()
        const updatedShopOrder= order.shopOrders.find(o=>o.shop && o.shop.toString()===shopId)

        await order.populate('shopOrders.shop','name')
        await order.populate('shopOrders.owner','fullname socketId')
        await order.populate('shopOrders.assignedDeliveryBoy','fullname email mobile')
        await order.populate('user','fullname email mobile socketId')
        await order.populate('shopOrders.shopOrderItems.items','name image price')

        const updatedShopOrderObj = {
            ...updatedShopOrder.toObject(),
            availableBoys: deliveryBoysPayload
        };

        //------- socket io execution for status update ---------
        const io=req.app.get('io')
        if(io){
            if(order.user?.socketId){
                io.to(order.user.socketId).emit('shopOrderUpdate',{
                    orderId:order._id,
                    shopOrder:updatedShopOrderObj
                })
            }
            if(updatedShopOrder.owner?.socketId){
                io.to(updatedShopOrder.owner.socketId).emit('shopOrderUpdate',{
                    orderId:order._id,
                    shopOrder:updatedShopOrderObj
                })
            }
        }

        console.log("Status updated to:", shopOrder.status);
       
        return res.status(200).json({
            shopOrder:updatedShopOrderObj,
            assignedDeliveryBoy:updatedShopOrder?.assignedDeliveryBoy,
            availableBoys:deliveryBoysPayload,
            assignment:updatedShopOrder?.assignment ? updatedShopOrder.assignment._id : null
        })

    } catch (error) {
          console.error("Update order status error:", error);
          res.status(500).json({message:`order status update error ${error.message}`})
    }
}



//-------------------------------------------- get deliveryboy assignment-------------------------------------------------
const getDeliveryBoyAssignment=async(req,res)=>{
    try {
        const deliveryBoyId=req.userId
        const assignments=await DeliveryAssignment.find({
            broadcastedTo:deliveryBoyId,
            status:'broadcasted'
        })
        .populate('order')
        .populate('shop')

        const formated=assignments.map(a=>({
            assignmentId:a._id,
            orderId:a.order._id,
            shopName:a.shop.name,
            deliveryAddress:a.order.deliveryAddress,
            items:a.order.shopOrders.find(so=>so._id.equals(a.shopOrderId))?.shopOrderItems || [],
            subtotal:a.order.shopOrders.find(so=>so._id.equals(a.shopOrderId))?.subtotal
        }))
        return res.status(200).json(formated)
    } catch (error) {
    res.status(500).json({message:`get assignment error ${error.message}`})

    }
}

//----------------------------------------------------- accept order--------------------------------------------------------
const acceptOrder=async(req,res)=>{
    try {
        const {assignmentId}=req.params
        const assignment=await DeliveryAssignment.findById(assignmentId)
        if(!assignment){
            return res.status(400).json({message:'assignment not found..'})
        }
        if(assignment.status!=='broadcasted'){
            return res.status(400).json({message:'assignment is expired...'})
        }

        const alreadyAssigned=await DeliveryAssignment.findOne({
            assignedTo:req.userId,
            status:{$nin:['broadcasted','completed']}
        })

        if(alreadyAssigned){
            return res.status(200).json({message:'You are already assigned to another order'})
        }
        assignment.assignedTo=req.userId
        assignment.status='assigned'
        assignment.acceptedAt=new Date()
        await assignment.save()

        const order=await Order.findById(assignment.order)
        if(!order){
            return res.status(400).json({message:'order not found..!'})
        }

        let shopOrder=order.shopOrders.id(assignment.shopOrderId)
        shopOrder.assignedDeliveryBoy=req.userId
        await order.save()

        await order.populate('shopOrders.shop','name')
        await order.populate('shopOrders.owner','fullname socketId')
        await order.populate('shopOrders.assignedDeliveryBoy','fullname email mobile')
        await order.populate('user','fullname email mobile socketId')
        await order.populate('shopOrders.shopOrderItems.items','name image price')

        const io=req.app.get('io')
        if(io){
            if(order.user?.socketId){
                io.to(order.user.socketId).emit('shopOrderUpdate',{
                    orderId:order._id,
                    shopOrder:shopOrder
                })
            }
            if(shopOrder.owner?.socketId){
                io.to(shopOrder.owner.socketId).emit('shopOrderUpdate',{
                    orderId:order._id,
                    shopOrder:shopOrder
                })
            }
        }

        return res.status(200).json({message:'order accepted'})

    } catch (error) {
        res.status(500).json({message:` accept order error ${error.message}`})

    }
}

//----------------------------------------------------- get current order---------------------------------------------------------

const getCurrentOrder=async(req,res)=>{
    try {
        const assignment=await DeliveryAssignment.findOne({
            assignedTo:req.userId,
            status:'assigned'
        })
        .populate('shop','name')
        .populate('assignedTo','fullname email mobile location')
        .populate({
            path:'order',
            populate:[{path:'user',select:'fullname email location mobile'}]
            
        })

        if(!assignment){
            return res.status(400).json({message:'assignment not found'})
        }

         if(!assignment.order){
            return res.status(400).json({message:'order not found'})
        }
        
        const shopOrder=assignment.order.shopOrders.find(so=>String(so._id)==String(assignment.shopOrderId))

        if(!shopOrder){
             return res.status(400).json({message:'shop order not found'})

        }

        let deliveryBoyLocation={lat:null,lon:null}
        if(assignment.assignedTo.location){
            const loc = assignment.assignedTo._doc && assignment.assignedTo._doc.location 
                        ? assignment.assignedTo._doc.location 
                        : assignment.assignedTo.location;
            if(loc.coordinates && loc.coordinates.length === 2){
                if(loc.coordinates[0] !== 0 || loc.coordinates[1] !== 0) {
                    deliveryBoyLocation.lon = loc.coordinates[0];
                    deliveryBoyLocation.lat = loc.coordinates[1];
                }
            } else if(Array.isArray(loc) && loc.length === 2){
                deliveryBoyLocation.lon = loc[0];
                deliveryBoyLocation.lat = loc[1];
            }
        }

        let customerLocation={lat:null,lon:null}
        if(assignment.order.deliveryAddress){
        customerLocation.lat=assignment.order.deliveryAddress.latitude
        customerLocation.lon=assignment.order.deliveryAddress.longitude

        }

        return res.status(200).json({
            _id:assignment.order._id,
            user:assignment.order.user,
            shopOrder,
            deliveryAddress:assignment.order.deliveryAddress,
            deliveryBoyLocation,
            customerLocation
        })

    } catch (error) {
         res.status(500).json({message:` current order error ${error.message}`})

    }
}

//----------------------------------------------------- Get Order By Id------------------------------------------------------------

const getOrderById=async(req,res)=>{
    try {
        
        const {orderId}=req.params
        const order=await Order.findById(orderId)
        .populate('user')
        .populate({
            path:'shopOrders.shop',
            model:'Shop'
        })
         .populate({
            path:'shopOrders.assignedDeliveryBoy',
            model:'User'
        })
         .populate({
            path:'shopOrders.shopOrderItems.items',
            model:'Item'
        }).lean()

        if(!order){
            return res.status(400).json({message:'order not found'})
        }
        return res.status(200).json(order)

    } catch (error) {
                res.status(500).json({message:` get order by id error ${error.message}`})
  
    }
}

//------------------------------------------------------- send Delivery OTP----------------------------------------------------
const sendDeliveryOtp=async(req,res)=>{
    try {
       
        const{orderId,shopOrderId}=req.body
        const order=await Order.findById(orderId).populate('user')
        const shopOrder=await order.shopOrders.id(shopOrderId)
        if(!order || !shopOrder){
            return res.status(400).json({message:'Enter valid order/shopOrderId'})
        }
        // otp create
        const otp=Math.floor(1000 + Math.random() * 9000).toString()
        shopOrder.deliveryOtp=otp
        shopOrder.otpExpires=Date.now()+5*60*1000
        await order.save()
        await sendDeliveryOtpMail(order.user,otp)
         return res.status(200).json({message:`Otp sent Successfully to ${order?.user?.fullname}`})

    } catch (error) {
        res.status(500).json({message:` delivery otp error ${error.message}`})
 
    }
}

//---------------------------------------------------- verify Delivery OTP-------------------------------------------------

const verifyDeliveryOtp=async(req,res)=>{
    try {
        const {orderId,shopOrderId,otp}=req.body
        const order=await Order.findById(orderId).populate('user')
        const shopOrder=await order.shopOrders.id(shopOrderId)
        if(!order || !shopOrder){
            return res.status(400).json({message:'Enter valid order/shopOrderId'})
        }
        if(shopOrder.deliveryOtp!==otp || !shopOrder.otpExpires || shopOrder.otpExpires<Date.now()){
            return res.status(400).json({message:'Invalid/Expired Otp'})
        }
        shopOrder.status='delivered'
        shopOrder.deliveredAt=Date.now()
        await order.save()
        await DeliveryAssignment.deleteOne({
            shopOrderId:shopOrder._id,
            order:order._id,
            assignedTo:shopOrder.assignedDeliveryBoy
        })

        await order.populate('shopOrders.shop','name')
        await order.populate('shopOrders.owner','fullname socketId')
        await order.populate('shopOrders.assignedDeliveryBoy','fullname email mobile')
        await order.populate('user','fullname email mobile socketId')
        await order.populate('shopOrders.shopOrderItems.items','name image price')

        const io=req.app.get('io')
        if(io){
            if(order.user?.socketId){
                io.to(order.user.socketId).emit('shopOrderUpdate',{
                    orderId:order._id,
                    shopOrder:shopOrder
                })
            }
            if(shopOrder.owner?.socketId){
                io.to(shopOrder.owner.socketId).emit('shopOrderUpdate',{
                    orderId:order._id,
                    shopOrder:shopOrder
                })
            }
        }

        return res.status(200).json({message:'Order Delivered Successfully!'})

    } catch (error) {
       res.status(500).json({message:` delivery otp verifiction error ${error.message}`})

    }
}


const getTodayDeliveries=async(req,res)=>{
    try {
        const deliveryBoyId=req.userId
        const startsOfDay=new Date()
        startsOfDay.setHours(0,0,0,0)

        const orders=await Order.find({
            "shopOrders.assignedDeliveryBoy":deliveryBoyId,
            "shopOrders.status":"delivered",
            "shopOrders.deliveredAt":{$gte:startsOfDay}
        }).lean()

        let todaysDeliveries=[]

        orders.forEach(order=>{
            order.shopOrders.forEach(shopOrder=>{
                if(shopOrder.assignedDeliveryBoy==deliveryBoyId && 
                    shopOrder.status=='delivered' && shopOrder.deliveredAt &&
                    shopOrder.deliveredAt>=startsOfDay
                ){
                    todaysDeliveries.push(shopOrder)
                }
            })
        })

        const stats={}

        todaysDeliveries.forEach(shopOrder=>{
            const hour=new Date(shopOrder.deliveredAt).getHours()
            stats[hour]=(stats[hour] || 0)+1
        })

        let formattedStats=Object.keys(stats).map(hour=>({
            hour:parseInt(hour),
            count:stats[hour]
        }))

        formattedStats.sort((a,b)=>a.hour-b.hour)
        return res.status(200).json(formattedStats)

        
    } catch (error) {
      return res.status(200).json(`today delivery error ${error}`)

    }
}


module.exports={placeOrder,getTodayDeliveries ,getMyOrders, updateOrderStatus,getDeliveryBoyAssignment,acceptOrder,getCurrentOrder,getOrderById,sendDeliveryOtp,verifyDeliveryOtp,verifyPayment}