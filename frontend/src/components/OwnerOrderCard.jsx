import axios from 'axios';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { MdPhone } from "react-icons/md";
import { serverUrl } from '../App';
import { setMyOrders } from '../redux/userSlice';

const OwnerOrderCard = ({data}) => {

  const [availableBoys, setAvailableBoys] = useState([])
  const dispatch = useDispatch();
  const shopOrder = data?.shopOrders?.[0];

  const handleUpdateStatus = async (orderId, shopId, newStatus) => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/order/update-status/${orderId}/${shopId}`,
        { status: newStatus },
        { withCredentials: true }
      );
      console.log(result);
      
      if(result.status === 200){
        // Refetch orders
        const ordersResult = await axios.get(`${serverUrl}/api/order/my-orders`, {
          withCredentials: true,
        });
        dispatch(setMyOrders(ordersResult.data));
        setAvailableBoys(result.data.availableBoys || [])
        
      }
    } catch (error) {
      console.log(error);
    }
  }
  
  return (
    <div className='bg-white rounded-xl shadow-lg p-4 space-y-4 transition-smooth-slow hover:shadow-2xl hover:-translate-y-1 border border-gray-100'>
      <div className='animate-fade-in-up'>
      <h2 className='text-base sm:text-lg font-semibold text-gray-800 transition-smooth hover:text-[#ff4d2d]'>{data.user?.fullname}</h2>
      <p className='text-sm text-gray-500'>{data.user?.email}</p>
      <p className='flex items-center gap-2 text-sm text-gray-600 mt-1 transition-smooth hover:text-[#ff4d2d]'><MdPhone /><span>{data.user?.mobile}</span></p>
      {data.paymentMethod==='online'?
        <p className='text-sm text-gray-600'>Payment: <span className='font-medium'>{data.payment?'Paid':'Pending'}</span></p>:
        <p className='text-sm text-gray-600'>Payment Method: <span className='font-medium uppercase'>{data.paymentMethod}</span></p>
      }
      </div>

      <div className='flex items-start flex-col gap-2 text-gray-600 text-sm bg-gray-50 p-3 rounded-lg transition-smooth-slow hover:bg-gray-100'>
        <p className='font-medium'>{data?.deliveryAddress?.text}</p>
        <p className='text-xs text-gray-500'>lat:{data?.deliveryAddress?.latitude} , lon:{data?.deliveryAddress?.longitude}</p>
      </div>

         {/* -------------items------------- */}
            <div className='flex space-x-3 sm:space-x-4 overflow-x-auto pb-2 scrollbar-hide'>
                  {shopOrder?.shopOrderItems?.map((item,index)=>(
                       <div key={index} className='flex-shrink-0 w-36 sm:w-40 border-2 rounded-xl p-2 bg-white transition-smooth-slow hover:shadow-lg hover:-translate-y-1 hover:border-[#ff4d2d]'>
                          <div className='w-full h-20 sm:h-24 rounded-lg overflow-hidden mb-2'>
                            <img src={item?.items?.image || item?.image} alt={item?.name} className='w-full h-full object-cover transition-smooth-slower hover:scale-110' />
                          </div>
                          <p className='text-sm font-semibold mt-1 truncate'>{item?.name}</p>
                          <p className='text-xs text-gray-500'> Qty: {item?.quantity} x ₹{item?.price} </p> 
                       </div>
                  ))}           
            </div>

            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-auto pt-3 border-t border-gray-200'>
               <span className='text-sm'>Status: <span className={`font-semibold capitalize px-3 py-1 rounded-full ${shopOrder?.status === 'delivered' ? 'text-green-600 bg-green-50' : 'text-[#ff4d2d] bg-orange-50'}`}>{shopOrder?.status || 'pending'}</span></span>
                   {/* drop down list - only show if not delivered */}
               {shopOrder?.status !== 'delivered' && (
                 <select 
                   value={shopOrder?.status || 'pending'}
                   className='w-full sm:w-auto rounded-xl border-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4d2d] border-[#ff4d2d] text-[#ff4d2d] font-medium cursor-pointer transition-smooth-slow hover:shadow-md' 
                   onChange={(e) => handleUpdateStatus(data._id, shopOrder?.shop?._id || shopOrder?.shop, e.target.value)}
                 >
                  <option value="pending">Pending</option>
                  <option value="preparing">Preparing</option>
                  <option value="out of delivery">Out Of Delivery</option>
                 </select>
               )}
               
               {/* Show completion badge if delivered */}
               {shopOrder?.status === 'delivered' && (
                 <span className='flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-xl font-medium text-sm'>
                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                   </svg>
                   Order Completed
                 </span>
               )}
            </div>

            {/*----------------- available delivery boys ----------------- */}
            {(shopOrder?.status === 'out of delivery') && 
            <div className='mt-3 p-3 sm:p-4 border-2 rounded-xl text-sm bg-gradient-to-br from-orange-50 to-orange-100 transition-smooth-slow hover:shadow-lg animate-fade-in-up'>
              <p className='font-semibold text-gray-800 mb-2'>{shopOrder?.assignedDeliveryBoy?'Assigned Delivery Boy':'Available Delivery Boys'}</p>
              {(availableBoys.length > 0 ? availableBoys : (shopOrder?.availableBoys || [])).length > 0 ? (
                <div className='space-y-2'>
                  {(availableBoys.length > 0 ? availableBoys : (shopOrder?.availableBoys || [])).map((b,index)=>(
                    <div key={index} className='text-gray-800 bg-white px-3 py-2 rounded-lg transition-smooth hover:shadow-md'>{b.fullname} - {b.mobile}</div>
                  ))}
                </div>
              ):shopOrder?.assignedDeliveryBoy?<div className='bg-white px-3 py-2 rounded-lg'>{shopOrder.assignedDeliveryBoy.fullname} - {shopOrder.assignedDeliveryBoy.mobile}</div>:<div className='text-gray-600 animate-pulse'>Waiting for Delivery Boy to accept...</div>}
            </div>
              }

            <div className='text-right font-bold text-gray-800 text-base sm:text-lg transition-bounce hover:scale-105'>
                Total: ₹{shopOrder?.subtotal || 0}
            </div>

    </div>
  )
}

export default OwnerOrderCard