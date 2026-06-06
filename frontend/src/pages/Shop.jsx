import axios from 'axios'
import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { serverUrl } from '../App'
import { useEffect } from 'react'
import { useState } from 'react'
import { FaStore } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { FaUtensils } from "react-icons/fa";
import FoodCard from '../components/FoodCard'
import { FaArrowLeft } from "react-icons/fa6";

const Shop = () => {
const navigate=useNavigate()
const {shopId}=useParams()
const [items, setItems] = useState([])
const [shop, setShop] = useState([])
const handleShop=async()=>{
    try {
        const result=await axios.get(`${serverUrl}/api/item/get-by-shop/${shopId}`,{withCredentials:true})
        setItems(result.data.items)
        setShop(result.data.shop)
    } catch (error) {
        console.log(error);
        
    }
}
useEffect(() => {
    handleShop()

}, [shopId])


  return (
    <div className='min-h-screen bg-gray-50 animate-fade-in'>
        {/* back button */}
        <button className='fixed sm:absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-sm text-white px-3 py-2 rounded-full shadow-xl transition-smooth-slow hover:bg-black/80 hover:scale-110 hover:shadow-2xl cursor-pointer active:scale-95 animate-fade-in-left' onClick={()=>navigate('/')}>
        <FaArrowLeft size={16} className="transition-smooth group-hover:-translate-x-1" />
         <span className='text-sm sm:text-base font-medium'>Back</span>
        </button>
        {shop && 
(        <div className='relative w-full'>
             {/* shop image */}
             <div className='relative w-full h-56 sm:h-64 md:h-80 lg:h-96 overflow-hidden'>
               <img src={shop.image} className='w-full h-full object-cover transition-smooth-slower hover:scale-110' />
              {/* shop name, address */}
              <div className='absolute inset-0 bg-gradient-to-b from-black/70 to-black/30 flex flex-col justify-center items-center text-center px-4'>
                  <FaStore className='text-white text-3xl sm:text-4xl mb-3 drop-shadow-md animate-bounce-in'/>
                  <h1 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white drop-shadow-lg animate-fade-in-up'>{shop.name}</h1>
                  <div className='flex items-center gap-[10px] mt-2 animate-fade-in-down'>
                  <FaLocationDot size={18} className='sm:w-[22px] sm:h-[22px] animate-pulse' color='red'/>
                  <p className='text-sm sm:text-base lg:text-lg font-medium text-gray-200'>{shop.address}</p>
                  </div>
              </div>
             </div>

             {/* ------------------- menu items--------------- */}
             <div className='max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10'>
                <h2 className='flex items-center justify-center gap-3 text-2xl sm:text-3xl font-bold mb-8 sm:mb-10 text-gray-800 animate-fade-in-up'>
                  <FaUtensils color='orange' size={24} className='sm:w-7 sm:h-7 transition-smooth hover:rotate-12'/>
                  <span>Our Menu</span>
                </h2>

                {items.length>0?(
                    <div className='flex flex-wrap justify-center gap-5 sm:gap-6 lg:gap-8'>
                        {items.map((item, idx)=>(
                            <div key={item._id} className="stagger-item">
                              <FoodCard data={item}/>
                            </div>
                        ))}
                    </div>
                ):(
                  <div className='text-center py-12 animate-scale-in'>
                    <div className='text-6xl mb-4 animate-float'>🍽️</div>
                    <p className='text-gray-500 text-base sm:text-lg'>No Items Available</p>
                  </div>
                )}

             </div>



        </div>)}

    </div>
  )
}

export default Shop