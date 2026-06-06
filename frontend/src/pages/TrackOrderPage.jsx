import axios from 'axios'
import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { serverUrl } from '../App'
import { useEffect } from 'react'
import { useState } from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import DeliveryBoyTracking from '../components/DeliveryBoyTracking'
import { useSelector } from 'react-redux'


const TrackOrderPage = () => {
  const navigate = useNavigate();
  const {orderId}=useParams()
  const [currentOrder, setCurrentOrder] = useState()
  const [liveLocation, setLiveLocation] = useState({})
  const {socket}=useSelector(state=>state.user)
  const handleGetOrder=async()=>{
    try {
      const result=await axios.get(`${serverUrl}/api/order/get-order-by-id/${orderId}`,{withCredentials:true})
       setCurrentOrder(result.data) 
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
  handleGetOrder()
  }, [orderId])

  useEffect(() => {
    socket.on('updateDeliveryLocation',({deliveryBoyId,latitude,longitude})=>{
    setLiveLocation(prev=>({
      ...prev,
      [deliveryBoyId]:{lat:latitude,lon:longitude}
    }))
    })
  
  }, [socket])
  
  
  return (
    <div className='min-h-screen bg-[#fff9f6] p-4 sm:p-6 animate-fade-in'>
      <div className='max-w-4xl mx-auto flex flex-col gap-4 sm:gap-6'>
         <div className="flex items-center gap-3 sm:gap-4 mb-2 animate-fade-in-down">
              <IoIosArrowRoundBack
                size={35}
                className="text-[#ff4d2d] cursor-pointer transition-bounce hover:scale-125 hover:-translate-x-2 active:scale-95"
                onClick={() => navigate("/")}
              />
              <h1 className='text-xl sm:text-2xl font-bold'>Track Order</h1>
            </div>
            {currentOrder?.shopOrders?.map((shopOrder,index)=>(
              <div className='bg-white p-4 sm:p-6 rounded-2xl shadow-xl border-2 border-orange-100 space-y-4 transition-smooth-slow hover:shadow-2xl animate-scale-in' key={index} style={{animationDelay: `${index * 0.1}s`}}>
                      <div className='space-y-2'>
                        <p className='text-base sm:text-lg font-bold mb-3 text-[#ff4d2d] transition-smooth hover:scale-105'>{shopOrder.shop.name}</p>
                        <p className='text-sm sm:text-base'><span className='font-semibold'>Items:</span> {shopOrder.shopOrderItems?.map(i=>i.name).join(', ')}</p>
                        <p className='text-sm sm:text-base'><span className='font-semibold'>Subtotal:</span> ₹{shopOrder.subtotal}</p>
                        <p className='mt-4 text-sm sm:text-base bg-gray-50 p-3 rounded-lg'><span className='font-semibold'>Delivery Address:</span> {currentOrder.deliveryAddress?.text}</p>
                      </div>
 
                {shopOrder.status!='delivered'?<>
                 {shopOrder.assignedDeliveryBoy?
                 <div className='text-sm bg-green-50 p-3 sm:p-4 rounded-xl text-gray-800 space-y-1 border-2 border-green-200 transition-smooth-slow hover:shadow-md'>
                  <p ><span className='font-semibold'>Delivery Boy Name:</span>  {shopOrder.assignedDeliveryBoy.fullname}</p>
                  <p ><span className='font-semibold'>Delivery Boy Contact:</span>  {shopOrder.assignedDeliveryBoy.mobile}</p>
                 </div>
                 :<p className='font-semibold text-sm sm:text-base text-orange-600 bg-orange-50 p-3 rounded-lg animate-pulse'>Delivery Boy not assigned yet...</p>}
                </>
                :<p className='text-green-600 font-semibold text-base sm:text-lg bg-green-50 p-3 rounded-lg flex items-center gap-2'>
                  <span>✓</span> Delivered
                </p>}

      {(shopOrder.assignedDeliveryBoy &&  shopOrder.status!=='delivered') &&
      <div className='h-64 sm:h-80 md:h-96 w-full rounded-2xl overflow-hidden shadow-lg border-2 border-gray-200 transition-smooth-slow hover:shadow-2xl animate-fade-in-up'>
      <DeliveryBoyTracking data={{
        deliveryBoyLocation: liveLocation[shopOrder.assignedDeliveryBoy._id] || {
          lat:shopOrder.assignedDeliveryBoy.location.coordinates[1],
          lon:shopOrder.assignedDeliveryBoy.location.coordinates[0],
        },

        customerLocation:{
          lat:currentOrder.deliveryAddress.latitude,
          lon:currentOrder.deliveryAddress.longitude,

        }
      }}/> </div>}
              </div>
            ))}
      </div>
    </div>
  )
}

export default TrackOrderPage