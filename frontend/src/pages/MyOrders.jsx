import React from "react";
import { useSelector } from "react-redux";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import UserOrderCard from "../components/UserOrderCard";
import OwnerOrderCard from "../components/OwnerOrderCard";
import DeliveryBoyOrderCard from "../components/DeliveryBoyOrderCard";
import useGetMyOrders from "../hooks/useGetMyOrders";

const MyOrders = () => {
  const navigate = useNavigate();
  const { userData, myOrders } = useSelector((state) => state.user);
  
  useGetMyOrders();

  return (
    <div className="w-full min-h-screen bg-[#fff9f6] flex justify-center px-4 animate-fade-in">
      <div className="w-full max-w-[800px] p-4 sm:p-6">
        {/* back button  and header*/}
        <div className="flex items-center gap-4 sm:gap-[20px] mb-6 animate-fade-in-down">
          <div className="z-[10]">
            <IoIosArrowRoundBack
              size={35}
              className="text-[#ff4d2d] cursor-pointer transition-bounce hover:scale-125 hover:-translate-x-2 active:scale-95"
              onClick={() => navigate("/")}
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-start animate-fade-in-right">
            {userData.role === 'deliveryBoy' ? 'My Deliveries' : 'My Orders'}
          </h1>
        </div>
        {/* Orders */}
        {myOrders && myOrders.length > 0 ? (
          <div className="space-y-4 sm:space-y-6">
            {myOrders?.map((order, idx) =>
              userData.role == "user" ? (
                <div key={order._id} className="stagger-item">
                  <UserOrderCard data={order} />
                </div>
              ) : userData.role == "owner" ? (
                <div key={order._id} className="stagger-item">
                  <OwnerOrderCard data={order} />
                </div>
              ) : userData.role == "deliveryBoy" ? (
                <div key={order._id} className="stagger-item">
                  <DeliveryBoyOrderCard data={order} />
                </div>
              ) : null
            )}
          </div>
        ) : (
          <div className="text-center py-12 animate-scale-in">
            <div className="text-6xl mb-4 animate-float">
              {userData.role === 'deliveryBoy' ? '🛵' : '📦'}
            </div>
            <p className="text-gray-500 text-base sm:text-lg mb-4">
              {userData.role === 'deliveryBoy' ? 'No deliveries yet' : 'No orders yet'}
            </p>
            <button 
              onClick={() => navigate('/')}
              className="px-6 py-2.5 bg-[#ff4d2d] text-white rounded-lg font-medium transition-smooth-slow hover:bg-[#e64526] hover:scale-105 hover:shadow-lg active:scale-95"
            >
              {userData.role === 'deliveryBoy' ? 'Go to Dashboard' : 'Start Ordering'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
