import React from 'react'
import { FaMinus } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import { CiTrash } from "react-icons/ci";
import { useDispatch } from 'react-redux';
import { removeCartItem, updateQuantity } from '../redux/userSlice';
const CartItemCard = ({data}) => {
    const dispatch=useDispatch()

    //------------increase function-----------------
     const handleIncrease=(id,currentQty)=>{
        dispatch(updateQuantity({id,quantity:currentQty+1}))
        
    }
   //------------decrease function----------------------
    const handleDecrease=(id,currentQty)=>{
              if(currentQty>1){
                dispatch(updateQuantity({id,quantity:currentQty-1}))  
              }
                   
    }
  return (
    <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 bg-white p-3 sm:p-4 rounded-xl shadow border transition-smooth-slow hover:shadow-xl hover:-translate-y-1 hover:border-[#ff4d2d]'>
        {/* -------------------------------left part------------------------------- */}
        <div className='flex items-center gap-3 sm:gap-4 w-full sm:w-auto'>
            <img src={data.image} alt={data.name}  className='w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border-2 border-gray-200 transition-smooth-slow hover:border-[#ff4d2d] hover:scale-110'/>
               {/* name ,price */}
            <div className='flex-1'>
                <h1 className='font-medium text-sm sm:text-base text-gray-800 transition-smooth hover:text-[#ff4d2d]'>{data.name}</h1>
                <p className='text-xs sm:text-sm text-gray-500'>₹{data.price} x {data.quantity}</p>
                <p className='font-bold text-sm sm:text-base text-gray-900 transition-smooth hover:text-[#ff4d2d]'>₹{data.price*data.quantity}</p>

            </div>

        </div>

       {/* -------------------------------right part------------------------------- */}
       <div className='flex items-center gap-2 sm:gap-3 self-end sm:self-auto'>
         <button
                      className="p-2 cursor-pointer bg-gray-100 rounded-full transition-smooth-fast hover:bg-[#ff4d2d] hover:text-white hover:scale-110 active:scale-90"
                      onClick={()=>handleDecrease(data.id,data.quantity)}
                    >
                      <FaMinus size={12} />
                    </button>
                    <span className='font-medium transition-bounce hover:scale-125'>{data.quantity}</span>
                    <button
                      className="p-2 cursor-pointer bg-gray-100 rounded-full transition-smooth-fast hover:bg-[#ff4d2d] hover:text-white hover:scale-110 active:scale-90"
                      onClick={()=>handleIncrease(data.id,data.quantity)}
                    >
                      <FaPlus size={12} />
                    </button>
                    {/* trash button */}                    
                    <button className='p-2 bg-red-100 text-red-600 rounded-full transition-smooth-slow hover:bg-red-600 hover:text-white hover:scale-110 cursor-pointer active:scale-90 hover:shadow-lg' onClick={()=>dispatch(removeCartItem(data.id))}><CiTrash size={18} style={{ fontWeight: "bold" }}/></button>


       </div>




    </div>
  )
}

export default CartItemCard