import React from "react";
import { useNavigate } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useSelector } from "react-redux";
import CartItemCard from "../components/CartItemCard";

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, totalAmount } = useSelector((state) => state.user);

  return (
    <div className="min-h-screen bg-[#fff9f6] flex justify-center p-4 sm:p-6 animate-fade-in">
      <div className="w-full max-w-[800px]">
        {/* --------------------------------------------------------------------------- */}
        <div className="flex items-center gap-[15px] sm:gap-[20px] mb-6 animate-fade-in-down">
          {/* back button */}
          <div className="z-[10]">
            <IoIosArrowRoundBack
              size={35}
              className="text-[#ff4d2d] cursor-pointer transition-bounce hover:scale-125 hover:-translate-x-2 active:scale-95"
              onClick={() => navigate("/")}
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-start animate-fade-in-right">Your Cart </h1>
        </div>

        {cartItems?.length==0 ?(
            <div className="text-center py-12 animate-scale-in">
              <div className="text-6xl mb-4 animate-bounce-in">🛒</div>
              <p className="text-gray-500 text-base sm:text-lg mb-4">Your Cart is empty</p>
              <button 
                onClick={() => navigate('/')}
                className="px-6 py-2.5 bg-[#ff4d2d] text-white rounded-lg font-medium transition-smooth-slow hover:bg-[#e64526] hover:scale-105 hover:shadow-lg active:scale-95"
              >
                Start Shopping
              </button>
            </div>
        ):(
          // ---------- item cart -----------------
           <>
             <div className="space-y-3 sm:space-y-4">
              {cartItems?.map((item,index)=>(
                <div key={index} className="stagger-item">
                  <CartItemCard data={item} />
                </div>
              ))}
            </div>
             {/* total amount */}
            <div className="mt-6 bg-white p-4 rounded-xl shadow-lg flex justify-between items-center border-2 border-[#ff4d2d] transition-smooth-slow hover:shadow-2xl hover:scale-[1.02] animate-fade-in-up">
              <h1 className="text-base sm:text-lg font-semibold">Total Amount</h1>
              <span className="text-lg sm:text-xl font-bold text-[#ff4d2d] transition-bounce hover:scale-125">₹{totalAmount}</span>
            </div>

            {/* checkout button */}
            <div className="mt-4 flex justify-end animate-fade-in-up">
              <button className="bg-gradient-to-r from-[#ff4d2d] to-[#ff6b4d] text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-base sm:text-lg font-semibold transition-smooth-slow hover:scale-105 hover:shadow-2xl cursor-pointer active:scale-95 ripple" onClick={()=>navigate('/checkout')}>Proceed to CheckOut</button>
            </div>
           </>
            
        )}
      </div>
    </div>
  );
};

export default CartPage;
