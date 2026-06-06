import React, { useEffect, useRef, useState } from "react";
import { FaChevronCircleLeft } from "react-icons/fa";
import { FaChevronCircleRight } from "react-icons/fa";
import { categories } from "../category.js";
import CategoryCard from "./CategoryCard";
import { useSelector } from "react-redux";
import FoodCard from "./FoodCard.jsx";
import { useNavigate } from "react-router-dom";

const UserDashboards = () => {

const {currentCity, shopsInMyCity,itemsInMyCity,searchItems}=useSelector(state=>state.user)

const navigate=useNavigate()

const cateScrollRef= useRef()
const shopScrollRef= useRef()

const [showLeftCateButton, setShowLeftCateButton] = useState(false)
const [showRightCateButton, setShowRightCateButton] = useState(false)

const [showLeftShopButton, setShowLeftShopButton] = useState(false)
const [showRightShopButton, setShowRightShopButton] = useState(false)
const [updatedItemsList, setUpdatedItemsList] = useState([])


//--------- get items by category-----------------

const handleFilterByCategory=(category)=>{
  if(category=="All"){
    setUpdatedItemsList(itemsInMyCity)
  }
  else{
    const filteredList=itemsInMyCity?.filter(i=>i.category===category)
    setUpdatedItemsList(filteredList)
  }
}

//-------------------------------------
useEffect(() => {
  setUpdatedItemsList(itemsInMyCity)
}, [itemsInMyCity])


//------------ update button----------------
const updateButton=(ref, setShowLeft, setShowRight)=>{
  const element=ref.current
  if(element){
    setShowLeft(element.scrollLeft>0)
    setShowRight(element.scrollLeft+element.clientWidth<element.scrollWidth)
  }
}

//--------- scroll handler--------------------------
const scrollHandler=(ref,direction)=>{
  if(ref.current){
    ref.current.scrollBy({
      left:direction=="left"?-200:200,
      behavior:'smooth'
    })
  }
}


 //------------------------------------------------
 useEffect(() => {
  const cateElement = cateScrollRef.current
  const shopElement = shopScrollRef.current
  
  // Setup for category scroll
  if(cateElement){
    updateButton(cateScrollRef, setShowLeftCateButton, setShowRightCateButton)
    
    const handleCateScroll = () => {
      updateButton(cateScrollRef, setShowLeftCateButton, setShowRightCateButton)
    }
    
    cateElement.addEventListener('scroll', handleCateScroll)
    
    // Cleanup for category
    return () => {
      cateElement.removeEventListener('scroll', handleCateScroll)
    }
  }
 }, [])
 
 useEffect(() => {
  const shopElement = shopScrollRef.current
  
  // Setup for shop scroll
  if(shopElement){
    updateButton(shopScrollRef, setShowLeftShopButton, setShowRightShopButton)
    
    const handleShopScroll = () => {
      updateButton(shopScrollRef, setShowLeftShopButton, setShowRightShopButton)
    }
    
    shopElement.addEventListener('scroll', handleShopScroll)
    
    // Cleanup for shop
    return () => {
      shopElement.removeEventListener('scroll', handleShopScroll)
    }
  }
 }, [])
  
  return (
    <div className="w-full min-h-screen bg-[#fff9f6] flex flex-col gap-5 items-center overflow-y-auto">
  {/* //----------------------------------------search Items------------------------------------ */}
  {searchItems && searchItems.length>0 && (
    <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-4 sm:p-5 bg-white shadow-md rounded-2xl animate-fade-in-up">
      <h1 className="text-gray-900 text-2xl md:text-3xl font-semibold border-b border-gray-200 pb-2">Search Results</h1>
      <div className="w-full h-auto flex flex-wrap gap-6 justify-center">
        {searchItems.map((item, idx)=>(
          <div key={item._id} className="stagger-item">
            <FoodCard data={item}/>
          </div>
        ))}
      </div>
    </div>
  )}
      
  {/* //----------------------------------------category------------------------------------ */}
      <div className="w-full max-w-6xl flex flex-col gap-5 items-start px-[10px]">
        <h1 className="text-gray-800 text-2xl md:text-3xl font-semibold">
          Inspiration for your first order
        </h1>
        {/* parent div */}
        <div className="w-full relative">

          {/* left button */}
          { showLeftCateButton && <button className="absolute left-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg z-10 transition-smooth hover:bg-[#e64528] hover:scale-110 active:scale-95"onClick={()=>scrollHandler(cateScrollRef,"left")}>
             <FaChevronCircleLeft size={20} /></button>}

          {/* categories */}
          <div className="w-full flex overflow-x-auto gap-4 pb-2 scrollbar-hide" ref={cateScrollRef}>
            {categories.map((cate, index) => (
              <CategoryCard name={cate.category} image={cate.image} key={index} onClick={()=>handleFilterByCategory(cate.category)}/>
            ))}
          </div>

          {/* right button */}
          {showRightCateButton && <button className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg z-10 transition-smooth hover:bg-[#e64528] hover:scale-110 active:scale-95" onClick={()=>scrollHandler(cateScrollRef,"right")}>
            <FaChevronCircleRight size={20} /></button>}
        </div>

      </div>

  {/* //---------------------------------------shop------------------------------------- */}
<div className="w-full max-w-6xl flex flex-col gap-5 items-start px-[10px]">
   <h1 className="text-gray-800 text-2xl md:text-3xl font-semibold">Best shops in {currentCity}</h1>
     <div className="w-full relative">

          {/* left button */}
          { showLeftShopButton && <button className="absolute left-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg z-10 transition-smooth hover:bg-[#e64528] hover:scale-110 active:scale-95"onClick={()=>scrollHandler(shopScrollRef,"left")}>
             <FaChevronCircleLeft size={20} /></button>}

          {/* shops */}
          <div className="w-full flex overflow-x-auto gap-4 pb-2 scrollbar-hide" ref={shopScrollRef}>
            {shopsInMyCity && shopsInMyCity.length > 0 ? (
              shopsInMyCity.map((shop, index) => (
                <CategoryCard name={shop.name} image={shop.image} key={index} onClick={()=>navigate(`/shop/${shop._id}`)}/>
              ))
            ) : (
              <p className="text-gray-500">No shops available in {currentCity}</p>
            )}
          </div>

          {/* right button */}
          {showRightShopButton && <button className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg z-10 transition-smooth hover:bg-[#e64528] hover:scale-110 active:scale-95" onClick={()=>scrollHandler(shopScrollRef,"right")}>
            <FaChevronCircleRight size={20} /></button>}
        </div>

</div>

  {/* //---------------------------------------product ------------------------------------- */}
  <div className="w-full max-w-6xl flex flex-col gap-5 items-start px-[10px] pb-8">
       <h1 className="text-gray-800 text-2xl md:text-3xl font-semibold">Suggested Food Items</h1>

       <div className="w-full h-auto flex flex-wrap gap-6 justify-center">
        {updatedItemsList?.map((item,index)=>(
          <div key={index} className="stagger-item">
            <FoodCard data={item}/>
          </div>
        ))}

       </div>



  </div>

    </div>
  );
};

export default UserDashboards;
