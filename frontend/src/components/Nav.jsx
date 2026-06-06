import React, { useEffect, useState } from "react";
import { FaLocationDot } from "react-icons/fa6";
import { IoIosSearch } from "react-icons/io";
import { LuShoppingCart } from "react-icons/lu";
import { useDispatch, useSelector } from "react-redux";
import { RxCross1 } from "react-icons/rx";
import axios from "axios";
import { serverUrl } from "../App";
import { setSearchItems, setUserData } from "../redux/userSlice";
import { FaPlus } from "react-icons/fa6";
import { TbReceiptDollar } from "react-icons/tb";
import { useNavigate } from "react-router-dom";

function Nav() {
  const { userData,currentCity,cartItems,myOrders } = useSelector((state) => state.user);
    const { myShopData } = useSelector((state) => state.owner);
  const [showInfo, setShowInfo] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [query, setQuery] = useState('')
  const dispatch=useDispatch()
  const navigate= useNavigate()
  
  // For owners, backend already filters orders to show only their shop orders
  // Each order in myOrders has shopOrders[0] as the owner's specific shop order
  const pendingOrdersCount = myOrders?.filter(order => {
    const shopOrder = order.shopOrders?.[0];
    return shopOrder && shopOrder.status !== 'delivered';
  }).length || 0;
  
//--------------- Search Items Functionality---------------------
const handleSearchItems=async()=>{
  try {
    const result=await axios.get(`${serverUrl}/api/item/search-items?query=${query}&city=${currentCity}`,{withCredentials:true})
     dispatch(setSearchItems(result.data))
  } catch (error) {
    console.log(error);
    
  }
}

useEffect(() => {
  if(query){
handleSearchItems()
  }else{
         dispatch(setSearchItems(null))
  }
}, [query])


  //---------------handle logout--------------------------------------------
  const handleLogOut=async()=>{
    try {
      const result= await axios.get(`${serverUrl}/api/auth/signout`,{withCredentials:true})
      dispatch(setUserData(null))
    } catch (error) {
      console.log(error);
      
    }

  }
  return (
    <div className="w-full h-[70px] sm:h-[80px] flex items-center justify-between md:justify-center gap-[20px] sm:gap-[30px] px-[15px] sm:px-[20px] fixed top-0 z-[9999] bg-[#fff9f6]/95 backdrop-blur-md overflow-visible shadow-lg animate-slide-in-down">
   
   {/* mobile search----------------------------------------------------------------------------------------------------------------------- */}
   {showSearch && userData.role=='user' && <div className="w-[90%] sm:w-[85%] h-[60px] sm:h-[70px] bg-white shadow-2xl rounded-xl items-center gap-[15px] sm:gap-[20px] flex fixed top-[75px] sm:top-[85px] left-[5%] sm:left-[7.5%] md:hidden animate-fade-in-down transition-smooth-slow border border-gray-100">
        {/* --------------city name---------------- */}
        <div className="flex items-center w-[30%] overflow-hidden gap-[8px] sm:gap-[10px] px-[8px] sm:px-[10px] border-r-[2px] border-gray-400">
          <FaLocationDot size={20} className="text-[#ff4d2d] flex-shrink-0 animate-pulse" />
          <div className="w-[80%] truncate text-gray-600 text-xs sm:text-sm">{currentCity}</div>
        </div>
        {/* --------------search bar---------------- */}
        <div className="w-[70%] flex items-center gap-[8px] sm:gap-[10px]">
          <IoIosSearch size={22} className="text-[#ff4d2d] flex-shrink-0" />
          <input
            type="text"
            placeholder="search delicious food...."
            className="px-[8px] sm:px-[10px] text-gray-700 text-sm outline-0 w-full bg-transparent transition-smooth focus:text-[#ff4d2d]"
            onChange={(e)=>setQuery(e.target.value)}
            value={query}
          />
        </div>
      </div>}

      <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-[#ff4d2d] animate-bounce-in">QuickBite</h1>

      {/* ------------------search bar / location----------------------- */}
    {userData.role=='user' &&   <div className="md:w-[60%] lg:w-[45%] xl:w-[40%] h-[60px] sm:h-[70px] bg-white shadow-xl rounded-xl items-center gap-[15px] sm:gap-[20px] hidden md:flex transition-smooth-slow hover:shadow-2xl hover:scale-[1.02] border border-gray-100">
        {/* --------------city name---------------- */}
        <div className="flex items-center w-[30%] overflow-hidden gap-[8px] sm:gap-[10px] px-[10px] sm:px-[12px] border-r-[2px] border-gray-400">
          <FaLocationDot size={22} className="text-[#ff4d2d] flex-shrink-0 animate-pulse" />
          <div className="w-[80%] truncate text-gray-600 text-sm">{currentCity}</div>
        </div>
        {/* --------------search bar---------------- */}
        <div className="w-[70%] flex items-center gap-[10px] pr-4">
          <IoIosSearch size={24} className="text-[#ff4d2d] flex-shrink-0 transition-smooth hover:scale-110"  />
          <input
            type="text"
            placeholder="search delicious food...."
            className="px-[10px] text-gray-700 text-sm outline-0 w-full bg-transparent transition-smooth focus:text-[#ff4d2d]"
            onChange={(e)=>setQuery(e.target.value)}
            value={query}
          />
        </div>
      </div>}

{/* ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */}
      <div className="flex items-center gap-3 sm:gap-4">

     {userData.role=='user' &&  (showSearch?
     <RxCross1 size={22} className="text-[#ff4d2d] md:hidden cursor-pointer transition-bounce hover:rotate-90 active:scale-90" onClick={()=>setShowSearch(false)}/>
     :
     <IoIosSearch size={24} className="text-[#ff4d2d] md:hidden cursor-pointer transition-bounce hover:scale-125 active:scale-95" onClick={()=>setShowSearch(true)}/>)}
       
{/* ------------------------ add food item-------------------------------------------------------------------- */}
{userData.role=='owner' ? <>
{myShopData &&  <>
  <button className="hidden md:flex items-center gap-1.5 px-3 py-2 cursor-pointer rounded-full bg-[#ff4d2d]/10 text-[#ff4d2d] font-medium transition-smooth-slow hover:bg-[#ff4d2d] hover:text-white hover:shadow-lg active:scale-95"onClick={()=>navigate('/add-item')}>
    <FaPlus size={18} className="transition-smooth group-hover:rotate-90" />
    <span className="text-sm">Add Food Item</span>
  </button>

  <button className="md:hidden flex items-center p-2.5 cursor-pointer rounded-full bg-[#ff4d2d]/10 text-[#ff4d2d] transition-smooth-slow hover:bg-[#ff4d2d] hover:text-white hover:shadow-lg active:scale-90" onClick={()=>navigate('/add-item')}>
    <FaPlus size={18} className="transition-smooth hover:rotate-90" />
  </button>
  </>
 }

  {/* ----------------------pending orders---------------------- */}
  <div className="hidden md:flex items-center gap-2 cursor-pointer relative px-3 py-2 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] font-medium transition-smooth-slow hover:bg-[#ff4d2d] hover:text-white hover:shadow-lg active:scale-95"onClick={()=>navigate('/my-orders')}>
   <TbReceiptDollar size={20} className="transition-smooth group-hover:scale-110"/>
   <span className="text-sm">My Orders</span>
   <span className="absolute -right-2 -top-2 text-xs font-bold text-white bg-[#ff4d2d] rounded-full px-[7px] py-[2px] shadow-lg animate-pulse">{pendingOrdersCount}</span>
  </div>

  <div className="md:hidden flex items-center gap-2 cursor-pointer relative p-2.5 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] font-medium transition-smooth-slow hover:bg-[#ff4d2d] hover:text-white hover:shadow-lg active:scale-90"onClick={()=>navigate('/my-orders')}>
   <TbReceiptDollar size={20}/>
   <span className="absolute -right-2 -top-2 text-xs font-bold text-white bg-[#ff4d2d] rounded-full px-[7px] py-[2px] shadow-lg animate-pulse">{pendingOrdersCount}</span>
  </div>
 
</>: (
  <>
          {/* -----------------cart------------------ */}
     {userData.role == 'user' &&    <div className="relative cursor-pointer transition-bounce hover:scale-125 active:scale-95" onClick={()=>navigate('/cart')}>
          <LuShoppingCart size={24} className="text-[#ff4d2d]" />
          <span className="text-[#ff4d2d] absolute top-[-12px] right-[-9px] text-sm font-semibold bg-white rounded-full w-5 h-5 flex items-center justify-center shadow-md animate-bounce">
            {cartItems?.length || 0}
          </span>
        </div>}
        {/* ---------my order--------- */}

        <button className="hidden md:block px-3 py-2 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] text-sm font-medium cursor-pointer transition-smooth-slow hover:bg-[#ff4d2d] hover:text-white hover:shadow-lg active:scale-95" onClick={()=>navigate('/my-orders')}>
          My Orders
        </button>
  </>
)}



        {/* ---------profile--------- */}
        <div className="w-[36px] h-[36px] sm:w-[40px] sm:h-[40px] rounded-full flex items-center justify-center bg-gradient-to-br from-[#ff4d2d] to-[#ff6b4d] text-white text-base sm:text-[18px] shadow-lg font-semibold cursor-pointer transition-bounce hover:scale-125 active:scale-95 hover:shadow-xl" onClick={()=>setShowInfo(prev=>!prev)}>
          {userData?.fullname.slice(0, 1)}
        </div>
         {/* ---------- popup ------------- */}
          {showInfo &&         <div className={`fixed top-[75px] sm:top-[85px] right-[10px] sm:right-[15px] ${userData.role=='deliveryBoy'?'md:right-[20%] lg:right-[40%]':'md:right-[10%] lg:right-[25%]'} w-[160px] sm:w-[180px] bg-white shadow-2xl rounded-xl p-[15px] sm:p-[20px] flex flex-col gap-[10px] z-[9999] animate-scale-in border border-gray-100`}>
          <div className="text-[15px] sm:text-[17px] font-semibold transition-smooth hover:text-[#ff4d2d]">{userData.fullname}</div>
          {userData.role=='user' && <div className="md:hidden text-[#ff4d2d] font-semibold cursor-pointer transition-bounce hover:scale-110 hover:translate-x-1 text-sm"onClick={()=>navigate('/my-orders')}>My Orders</div>}
          <div className="text-[#ff4d2d] font-semibold cursor-pointer transition-bounce hover:scale-110 hover:translate-x-1 text-sm" onClick={handleLogOut}>Log Out</div>

        </div>}
      </div>
    </div>
  );
}

export default Nav;
