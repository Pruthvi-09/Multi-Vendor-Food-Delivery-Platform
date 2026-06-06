import React from "react";
import Nav from "./Nav";
import { useSelector } from "react-redux";
import axios from "axios";
import { serverUrl } from "../App";
import { useEffect } from "react";
import { useState } from "react";
import DeliveryBoyTracking from "./DeliveryBoyTracking";

const DeliveryBoy = () => {
  const [otp, setOtp] = useState("")
  const [showOtpBox, setShowOtpBox] = useState(false)
  const [deliveryCompleted, setDeliveryCompleted] = useState(false)
  const [availableAssignments, setAvilableAssignments] = useState(null);
  const [todayDeliveries, setTodayDeliveries] = useState([])
  const [currentOrder, setCurrentOrder] = useState()
  const { userData,socket } = useSelector((state) => state.user);

useEffect(() => {
  if(!socket || userData.role!=='deliveryBoy') return

 let watchId
  if(navigator.geolocation){
    watchId=navigator.geolocation.watchPosition((position)=>{
      const latitude=position.coords.latitude
      const longitude=position.coords.longitude
      socket.emit('updateLocation',{
        latitude,
        longitude,
        userId:userData._id
      })
    }),
    (error)=>{
      console.log(error);
      
    },{
      enableHighAccuracy:true,

    }
  }

  return () => {
   if(watchId)navigator.geolocation.clearWatch(watchId)
  }
}, [socket,userData])


  //------------------- get assignment---------------
  const getAssignment = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-assignments`, {
        withCredentials: true,
      });
      setAvilableAssignments(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  //----------------- get current order---------------
  const getCurrentOrder=async()=>{
     try {
      const result = await axios.get(`${serverUrl}/api/order/get-current-order`, {withCredentials: true});
       setCurrentOrder(result.data)
    } catch (error) {
      // 400 error is expected when no current order exists
      if (error.response?.status !== 400) {
        console.log(error);
      }
      // Clear current order if 400 error (no active order)
      setCurrentOrder(null);
    }
  }

  //------------- socket io---------------------

  useEffect(() => {
    if (!socket || !userData?._id) return;

    const handleNewAssignment = (data) => {
      if (data.sentTo === userData._id || data.sendTo === userData._id) {
        setAvilableAssignments((prev) => {
          const list = prev || [];
          if (list.some((a) => a.assignmentId === data.assignmentId)) return list;
          return [...list, data];
        });
      }
    };

    socket.on('newAssignment', handleNewAssignment);
  
    return () => {
      socket.off('newAssignment', handleNewAssignment);
    }
  }, [socket, userData?._id])
  



  //--------------- accept order functionality----------------
  const acceptOrder=async(assignmentId)=>{
    try {
      const result = await axios.get(`${serverUrl}/api/order/accept-order/${assignmentId}`, {withCredentials: true});
      console.log(result.data);
      await getCurrentOrder()
    } catch (error) {
      console.log(error);
      
    }
  }
    //--------------- send otp functionality----------------
  const sendOtp=async()=>{
    try {
      const result = await axios.post(`${serverUrl}/api/order/send-delivery-otp`,{orderId:currentOrder._id,shopOrderId:currentOrder.shopOrder._id}, {withCredentials: true});
       setShowOtpBox(true)
      console.log(result.data);
    } catch (error) {
      console.log(error);
      
    }
  }

      //--------------- verify otp functionality----------------
  const verifyOtp=async()=>{
    try {
      const result = await axios.post(`${serverUrl}/api/order/verify-delivery-otp`,{orderId:currentOrder._id,shopOrderId:currentOrder.shopOrder._id,otp}, {withCredentials: true});
      console.log(result.data);
      if(result.status === 200) {
        setDeliveryCompleted(true);
        // Refresh today's deliveries
        await handleTodayDeliveries();
        // Clear current order after a delay
        setTimeout(() => {
          setCurrentOrder(null);
          setShowOtpBox(false);
          setDeliveryCompleted(false);
          setOtp("");
          // Refresh assignments to get new orders
          getAssignment();
        }, 2500);
      }
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Invalid OTP. Please try again.");
    }
  }

        //--------------- today's deliveries functionality----------------
  const handleTodayDeliveries=async()=>{
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-today-deliveries`, {withCredentials: true});
      console.log(result.data);
      setTodayDeliveries(result.data)
    } catch (error) {
      console.log(error);
      
    }
  }

    useEffect(() => {
    if (!userData?._id) return;
    getAssignment();
    getCurrentOrder();
    handleTodayDeliveries();
  }, [userData?._id]);


  // Separate useEffect to handle order updates - only runs when needed
  useEffect(() => {
    if (!socket || !userData?._id) return;

    const handleOrderStatusUpdate = () => {
      // Only fetch current order if we don't have deliveryCompleted flag set
      if (!deliveryCompleted) {
        getCurrentOrder();
      }
    };

    socket.on('shopOrderUpdate', handleOrderStatusUpdate);

    return () => {
      socket.off('shopOrderUpdate', handleOrderStatusUpdate);
    };
  }, [socket, userData?._id, deliveryCompleted]);


  const liveLat = Array.isArray(userData?.location)
    ? userData.location[1]
    : userData?.location?.coordinates?.[1];
  const liveLon = Array.isArray(userData?.location)
    ? userData.location[0]
    : userData?.location?.coordinates?.[0];

  return (
    <div className="w-screen  min-h-screen bg-[#fff9f6] flex flex-col gap-5 items-center overflow-y-auto">
      <Nav />
      <div className="w-full max-w-[800px] flex flex-col gap-5 items-center">
        <div className="bg-white rounded-2xl shadow-md p-5 flex justify-start text-center items-center w-[90%] gap-2 border border-orange-100 flex-col ">
          <h1 className="text-xl font-bold text-[#ff4d2d]">
            Welcome, {userData?.fullname}
          </h1>
          <p className="">
            <span className="font-semibold text-[#ff4d2d]">Latitude:</span>
            {liveLat}
            , <span className="font-semibold text-[#ff4d2d]">Longitude:</span>
            {liveLon}
          </p>
        </div>
                     {/* ------------------- todays deliveries--------------- */}
                     <div className="bg-white rounded-2xl shadow-md p-6 w-[90%] mb-6 border border-orange-100">
                       <div className="flex justify-between items-center mb-4">
                         <h1 className="text-lg font-bold text-[#ff4d2d]">📊 Today's Activity Summary</h1>
                         {todayDeliveries.length > 0 && (
                           <span className="bg-orange-100 text-orange-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                             Active
                           </span>
                         )}
                       </div>

                       {todayDeliveries.length > 0 ? (
                         <div>
                           {/* Quick stats cards */}
                           <div className="grid grid-cols-3 gap-3 mb-6 w-full">
                             <div className="bg-orange-50/50 p-3 rounded-xl border border-orange-100/50 flex flex-col items-center text-center">
                               <span className="text-[10px] text-gray-500 font-semibold mb-1 uppercase tracking-wider">Total Deliveries</span>
                               <span className="text-xl font-bold text-gray-800">
                                 {todayDeliveries.reduce((sum, item) => sum + item.count, 0)}
                               </span>
                             </div>
                             <div className="bg-green-50/50 p-3 rounded-xl border border-green-100/50 flex flex-col items-center text-center">
                               <span className="text-[10px] text-green-600 font-semibold mb-1 uppercase tracking-wider">Today's Earnings</span>
                               <span className="text-xl font-bold text-green-700">
                                 ₹{todayDeliveries.reduce((sum, item) => sum + item.count, 0) * 40}
                               </span>
                             </div>
                             <div className="bg-orange-50/50 p-3 rounded-xl border border-orange-100/50 flex flex-col items-center text-center">
                               <span className="text-[10px] text-gray-500 font-semibold mb-1 uppercase tracking-wider">Peak Hour</span>
                               <span className="text-xl font-bold text-gray-800 whitespace-nowrap">
                                 {(() => {
                                   const peak = todayDeliveries.reduce((max, item) => item.count > max.count ? item : max, { count: 0, hour: 0 });
                                   if (peak.count === 0) return "N/A";
                                   const hour = peak.hour;
                                   const ampm = hour >= 12 ? 'PM' : 'AM';
                                   const displayHour = hour % 12 === 0 ? 12 : hour % 12;
                                   return `${displayHour} ${ampm}`;
                                 })()}
                               </span>
                             </div>
                           </div>

                           {/* Custom CSS Bar Chart */}
                           <div className="border border-orange-100/30 rounded-xl p-4 bg-gray-50/30">
                             <p className="text-xs font-semibold text-gray-500 mb-2">Hourly Distribution</p>
                             <div className="flex items-end justify-start h-[160px] gap-3 pt-6 overflow-x-auto">
                               {todayDeliveries.map((item, index) => {
                                 const maxCount = Math.max(...todayDeliveries.map(d => d.count), 1);
                                 const percentage = (item.count / maxCount) * 100;
                                 
                                 const hour = item.hour;
                                 const ampm = hour >= 12 ? 'PM' : 'AM';
                                 const displayHour = hour % 12 === 0 ? 12 : hour % 12;
                                 const formattedHour = `${displayHour} ${ampm}`;

                                 return (
                                   <div key={index} className="flex flex-col items-center min-w-[50px] flex-1 group">
                                     {/* Count bubble */}
                                     <span className="text-xs font-bold text-[#ff4d2d] bg-orange-100/80 px-2 py-0.5 rounded-md mb-2 shadow-sm transition-transform duration-200 group-hover:scale-110">
                                       {item.count}
                                     </span>
                                     
                                     {/* Bar */}
                                     <div className="w-full relative flex justify-center items-end h-[100px]">
                                       <div 
                                         className="w-8 bg-gradient-to-t from-[#ff4d2d] to-orange-400 rounded-t-lg transition-all duration-500 ease-out hover:brightness-110 shadow-sm cursor-pointer"
                                         style={{ height: `${percentage}%`, minHeight: '6px' }}
                                       ></div>
                                     </div>
                                     
                                     {/* Hour label */}
                                     <span className="text-[10px] text-gray-500 mt-2 font-semibold">
                                       {formattedHour}
                                     </span>
                                   </div>
                                 );
                                })}
                             </div>
                           </div>
                         </div>
                       ) : (
                         /* Empty State */
                         <div className="flex flex-col items-center justify-center py-8 text-center">
                           <div className="text-4xl mb-3">🛵</div>
                           <p className="text-gray-800 font-bold text-base mb-1">No Deliveries Yet</p>
                           <p className="text-gray-400 text-xs max-w-[280px]">
                             You haven't completed any deliveries today. Accepted orders will show up here as statistics.
                           </p>
                         </div>
                       )}
                     </div>





             {/* ------------------- order assignmenats--------------- */}
         {!currentOrder &&    
        <div className="bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100">
          <h1 className="text-lg font-bold mb-4 flex items-center gap-2"> Available Orders</h1>
          <div className="space-y-4">
            {availableAssignments?.length > 0 ? (
              availableAssignments.map((a, index) => (
                <div
                  className="border rounded-lg p-4 flex  justify-between items-center"
                  key={index}
                >
                  <div>
                    <p className="text-sm font-semibold">{a?.shopName}</p>
                    <p className="text-sm text-gray-500"><span className="font-semibold">Delivery Address:</span>{a?.deliveryAddress.text}</p>
                    <p className="text-sm text-gray-400"> {a.items.length} items | {a.subtotal}</p>
                  </div>
                  <button className="bg-orange-500 text-white px-4 py-1 rounded-lg text-sm active:bg-orange-600 cursor-pointer" onClick={()=>acceptOrder(a?.assignmentId)}>Accept</button>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No Available Orders</p>
            )}
          </div>
          
        </div>}

        {/* if the current order is available then show this section */}

        {currentOrder && 
        <div className="bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100">
            <h2 className="text-lg font-bold mb-3">📦 Current Order</h2>
            <div className="border rounded-lg p-4 mb-3">
                <p className="font-semibold text-sm">{currentOrder?.shopOrder.shop.name}</p>
                <p className="text-sm text-gray-600">{currentOrder.deliveryAddress.text}</p>
                <p className="text-sm text-gray-400"> {currentOrder.shopOrder.shopOrderItems.length} items | ₹{currentOrder.shopOrder.subtotal}</p>
            </div>
            
            {!deliveryCompleted && (
              <DeliveryBoyTracking 
                data={currentOrder}
                liveDeliveryBoyLocation={{ lat: liveLat, lon: liveLon }}
              />
            )}

     {deliveryCompleted ? (
       // Success message after delivery
       <div className="mt-4 p-6 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl text-center animate-fade-in">
         <div className="text-5xl mb-3 animate-bounce-in">✅</div>
         <h3 className="text-xl font-bold text-green-700 mb-2">Delivery Completed!</h3>
         <p className="text-green-600 text-sm">Order successfully delivered to {currentOrder.user.fullname}</p>
         <p className="text-green-500 text-xs mt-2">Returning to dashboard...</p>
       </div>
     ) : !showOtpBox ? (
       <button className="mt-4 w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-xl shadow-md hover:bg-green-600 active:scale-95 transition-all duration-200 cursor-pointer" onClick={sendOtp}>
         Mark As Delivered
       </button>
     ) : (
       <div className="mt-4 p-4 border-2 border-orange-200 rounded-xl bg-orange-50">
         <p className="text-sm font-semibold mb-2">Enter OTP sent to <span className="text-orange-600">{currentOrder.user.fullname}</span></p>
         <input 
           type="text"  
           className="w-full border-2 border-orange-300 px-3 py-2 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-orange-500" 
           placeholder="Enter 4-digit OTP" 
           onChange={(e)=>setOtp(e.target.value)} 
           value={otp}
           maxLength="4"
         />
         <button className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 active:scale-95 transition-all cursor-pointer" onClick={verifyOtp}>
           Submit OTP
         </button>
       </div>
     )}
        </div>
        }

      
      </div>
    </div>
  );
};

export default DeliveryBoy;
                                                                                         