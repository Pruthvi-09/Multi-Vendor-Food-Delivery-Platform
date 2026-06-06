import React from 'react'
import { FaCircleCheck } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';

const OrderPlaced = () => {

  const navigate=useNavigate()
  return (
    <div className='min-h-screen bg-gradient-to-br from-[#fff9f6] to-[#ffe8e0] flex flex-col justify-center items-center px-4 text-center relative overflow-hidden animate-fade-in'>
        {/* Decorative circles */}
        <div className='absolute top-20 left-10 w-32 h-32 bg-[#ff4d2d]/10 rounded-full blur-3xl animate-pulse'></div>
        <div className='absolute bottom-20 right-10 w-40 h-40 bg-[#ff4d2d]/10 rounded-full blur-3xl animate-pulse' style={{animationDelay: '1s'}}></div>
        
        <div className='relative z-10 flex flex-col items-center animate-scale-in'>
          <div className='mb-6 animate-bounce-in'>
            <div className='relative'>
              <FaCircleCheck className='text-green-500 text-6xl sm:text-7xl md:text-8xl drop-shadow-lg'/>
              <div className='absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse'></div>
            </div>
          </div>
          
          <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 animate-fade-in-up'>Order Placed Successfully!</h1>
          <p className='text-gray-600 text-sm sm:text-base max-w-md mb-8 leading-relaxed animate-fade-in-up' style={{animationDelay: '0.2s'}}>
            Thank you for your purchase. Your order is being prepared.
            You can track your order status in the "My Orders" section.
          </p>
          
          <button 
            className='bg-gradient-to-r from-[#ff4d2d] to-[#ff6b4d] hover:from-[#e64526] hover:to-[#e64526] text-white px-6 sm:px-8 py-3 rounded-xl text-base sm:text-lg font-semibold transition-smooth-slow hover:scale-105 hover:shadow-2xl active:scale-95 cursor-pointer ripple animate-fade-in-up' 
            style={{animationDelay: '0.4s'}}
            onClick={()=>navigate('/my-orders')}
          >
            View My Orders
          </button>
        </div>
    </div>
  )
}

export default OrderPlaced