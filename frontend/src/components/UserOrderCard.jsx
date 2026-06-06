import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { serverUrl } from "../App.jsx";
import { useDispatch, useSelector } from 'react-redux';
import { setItemsInMyCity } from '../redux/userSlice.js';


const UserOrderCard = ({data}) => {
  const dispatch = useDispatch();
  const { currentCity } = useSelector(state => state.user);

  const formatDate=(dateString)=>{
    const date=new Date(dateString)
    return date.toLocaleString('en-GB',{
      day:'2-digit',
      month:'short',
      year:'numeric'
    })
  }

  if(!data || !data._id){
    return null
  }
  const navigate=useNavigate()
  const [selectedRating, setSelectedRating] = useState({})
  const [isRating, setIsRating] = useState(false)

  // Fetch user's existing ratings for delivered items
  useEffect(() => {
    const fetchUserRatings = async () => {
      const deliveredItems = [];
      
      // Collect all item IDs from delivered orders
      data.shopOrders?.forEach(shopOrder => {
        if(shopOrder.status === 'delivered') {
          shopOrder.shopOrderItems?.forEach(item => {
            if(item.items?._id) {
              deliveredItems.push(item.items._id);
            }
          });
        }
      });

      if(deliveredItems.length > 0) {
        try {
          const result = await axios.post(`${serverUrl}/api/item/get-user-ratings`, 
            { itemIds: deliveredItems },
            { withCredentials: true }
          );
          setSelectedRating(result.data);
        } catch (error) {
          console.log(error);
        }
      }
    };

    fetchUserRatings();
  }, [data]);

  const handleRating=async(itemId,rating)=>{
    setIsRating(true);
    try {
      const result=await axios.post(`${serverUrl}/api/item/rating`,{itemId,rating},{withCredentials:true})
      setSelectedRating(prev=>({
        ...prev,[itemId]:rating
      }))
      
      // Refetch items to update the home page with new ratings
      const itemsResult = await axios.get(`${serverUrl}/api/item/get-by-city/${currentCity}`, {
        withCredentials: true,
      });
      dispatch(setItemsInMyCity(itemsResult.data));
      
      // Show success feedback
      setTimeout(() => {
        setIsRating(false);
      }, 500);
      
    } catch (error) {
      console.log(error);
      setIsRating(false);
    }
  }
   
  return (
    <div className='bg-white rounded-xl shadow-lg p-4 space-y-4 transition-smooth-slow hover:shadow-2xl hover:-translate-y-1 border border-gray-100'>
      <div className='flex flex-col sm:flex-row justify-between gap-3 border-b pb-3'>
        {/* ----------------------------------------left side---------------------------------------- */}
        <div className='animate-fade-in-left'>
          <p className='font-semibold text-base sm:text-lg'>Order #{data._id?.slice(-6)}</p>
          <p className='text-sm text-gray-500'>Date: {formatDate(data.createdAt)}</p>
        </div>
          {/* ----------------------------------------right side---------------------------------------- */}
        <div className='text-left sm:text-right animate-fade-in-right'>
          {data.paymentMethod=='cod'?<p className='text-sm text-gray-500'>{data.paymentMethod?.toUpperCase()}</p>:<p className='text-sm text-gray-500 font-semibold'>Payment:{data.payment?'Paid':'Pending'}</p>}
          <p className='font-medium text-blue-600 capitalize'>{data.shopOrders?.[0]?.status}</p>
        </div>
      </div>

      {data.shopOrders?.map((shopOrder,index)=>(
           <div className='rounded-xl p-3 sm:p-4 bg-gradient-to-br from-[#fffaf7] to-[#fff9f6] space-y-3 transition-smooth-slow hover:shadow-md' key={index}>
            <p className='font-semibold text-gray-800 text-base sm:text-lg transition-smooth hover:text-[#ff4d2d]'>{shopOrder.shop?.name}</p>
            <div className='flex space-x-3 sm:space-x-4 overflow-x-auto pb-2 scrollbar-hide'>
                  {shopOrder.shopOrderItems?.map((item,idx)=>(
                       <div key={idx} className='flex-shrink-0 w-36 sm:w-40 border-2 rounded-xl p-2 bg-white transition-smooth-slow hover:shadow-lg hover:-translate-y-1 hover:border-[#ff4d2d]'>
                          <div className='w-full h-20 sm:h-24 rounded-lg overflow-hidden mb-2'>
                            <img src={item.items?.image} alt={item.name} className='w-full h-full object-cover transition-smooth-slower hover:scale-110' />
                          </div>
                          <p className='text-sm font-semibold truncate transition-smooth hover:text-[#ff4d2d]'>{item.name}</p>
                          <p className='text-xs text-gray-500'> Qty: {item.quantity} x ₹{item.price} </p> 

                        {shopOrder.status=='delivered' && 
                        <div className='flex flex-col items-center mt-2'>
                          <div className='flex space-x-1 justify-center'>
                            {[1,2,3,4,5].map((star)=>(
                              <button 
                              key={star}
                              className={`text-lg transition-smooth-fast hover:scale-125 ${selectedRating[item.items?._id]>=star?'text-yellow-400':'text-gray-300 hover:text-yellow-400'} ${isRating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                              onClick={()=>handleRating(item.items?._id,star)}
                              disabled={isRating}
                              title={selectedRating[item.items?._id] ? 'Update your rating' : 'Rate this item'}
                              >★</button>
                            ))}
                          </div>
                          {selectedRating[item.items?._id] && (
                            <p className='text-xs text-green-600 mt-1 animate-fade-in'>
                              {selectedRating[item.items?._id] === item.items?._id ? '✓ Rated!' : '✓ Your rating'}
                            </p>
                          )}
                        </div>}
                       </div>
                  ))}           
            </div>

            {/* -----------------------------Subtotal------------------------- */}
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-t pt-2'>
              <p className='font-semibold text-sm sm:text-base'>Subtotal: ₹{shopOrder.subtotal}</p>
              <span className='text-sm font-medium text-blue-600 px-3 py-1 bg-blue-50 rounded-full capitalize'>{shopOrder.status}</span>
            </div>
           </div>
      ))}

      {/* ----------------------bottom------------------- */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-t pt-3'>
        <p className='font-bold text-base sm:text-lg transition-bounce hover:scale-105'>Total: ₹{data.totalAmount}</p>
        <button className='w-full sm:w-auto bg-gradient-to-r from-[#ff4d2d] to-[#ff6b4d] hover:from-[#e64526] hover:to-[#e64526] text-white px-5 py-2 rounded-xl text-sm font-medium cursor-pointer transition-smooth-slow hover:shadow-lg hover:scale-105 active:scale-95 ripple' onClick={()=>navigate(`/track-order/${data._id}`)}>Track Order</button>
      </div>
    </div>
  )
  }

export default UserOrderCard