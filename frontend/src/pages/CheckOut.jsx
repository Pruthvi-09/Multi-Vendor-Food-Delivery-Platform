import React, { useEffect, useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { FaLocationDot } from "react-icons/fa6";
import { TbCurrentLocation } from "react-icons/tb";
import { IoSearchSharp } from "react-icons/io5";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";
import "leaflet/dist/leaflet.css";
import { setAddress, setLocation } from "../redux/mapSlice";
import { MdDeliveryDining } from "react-icons/md";
import { FaMobileScreenButton } from "react-icons/fa6";
import { FaCreditCard } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../App";
import { addMyOrders, clearCart } from "../redux/userSlice";

//--- recenter existing location-------------
function RecenterMap({ location }) {
  if (location.lat && location.lon) {
    const map = useMap();
    map.setView([location.lat, location.lon], 16, { animate: true });
  }
  return null;
}

const CheckOut = () => {
  const navigate=useNavigate()
  const { location, address } = useSelector((state) => state.map);
  const { cartItems,totalAmount,userData } = useSelector((state) => state.user);

  const [addressInput, setAddressInput] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("cod")

  const dispatch = useDispatch();
   const apikey = import.meta.env.VITE_GEOAPIKEY;
  const deliveryFee=totalAmount>500?0:40
  const AmountWithDeliveryFee=totalAmount+deliveryFee


  // --------------dragend event for dragable location--------------
  const onDragEnd = (e) => {
    const { lat, lng } = e.target._latlng;
    dispatch(setLocation({ lat, lon: lng }));
    getAddressByLatLng(lat, lng);
  };

  //---------- get address by lat, lon-------
  const getAddressByLatLng = async (lat, lng) => {
    try {
      const result = await axios.get(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&apiKey=${apikey}`,
      );

      dispatch(setAddress(result?.data?.results[0]?.formatted));
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  };

  //-------------------- get current location---------------------------
  const getCurrentLocation = async () => {
     const latitude=userData.location.coordinates[1]
      const longitude=userData.location.coordinates[0] 
      dispatch(setLocation({lat:latitude,lon:longitude}))
       getAddressByLatLng(latitude,longitude );
  };


  //----------------get lat lng by address----------------------------
  const getLatLngByAddress=async()=>{
      try {
        const result=await axios.get(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(addressInput)}&apiKey=${apikey}`)
        const{lat,lon}=result.data.features[0].properties
        dispatch(setLocation({lat,lon}))
        
      } catch (error) {
        console.log(error);
        
      }
  }
  //--------------------- place order function-----------------------------

  const handlePlaceOrder=async()=>{
      try {
      const result= await axios.post(`${serverUrl}/api/order/place-order`,{
        paymentMethod,
        deliveryAddress:{
          text:addressInput,
          latitude:location.lat,
          longitude:location.lon
        },
        totalAmount:AmountWithDeliveryFee,
        cartItems
      },{withCredentials:true})

      if(paymentMethod=='cod'){
      dispatch(addMyOrders(result.data))
      dispatch(clearCart())
      navigate('/order-placed')
      }else{
        const orderId=result.data.orderId
        const razorOrder=result.data.razorOrder
        openRazorpayWindow(orderId,razorOrder)
       
      } 
    } catch (error) {
        console.log(error);}
  }

  const openRazorpayWindow=(orderId,razorOrder)=>{
   const options={
   key:import.meta.env.VITE_RAZORPAY_KEY_ID,
   amount:razorOrder.amount,
   currency:'INR',
   name:'QuickBite',
   description:'Food Delivery Website',
   order_id:razorOrder.id,
   prefill: {
     contact: userData?.mobile || '',
     email: userData?.email || ''
   },
   handler:async function (response){
    try {
      const result=await axios.post(`${serverUrl}/api/order/verify-payment`,{
        razorpay_payment_id:response.razorpay_payment_id,
        orderId
      },{withCredentials:true})
       dispatch(addMyOrders(result.data))
       dispatch(clearCart())
        navigate('/order-placed')
    } catch (error) {
      console.log(error);
      
    }
   },

   }
   const rzp= new window.Razorpay(options)
   rzp.open()
  }
  

  useEffect(()=>{
   setAddressInput(address)
  },[address])

  return (
    <div className="min-h-screen bg-[#fff9f6] flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fade-in">
      {/* -------------------------------------------------------------------------------- */}
      {/* back button */}
      <div className="fixed sm:absolute top-4 left-4 z-[20] animate-fade-in-left">
        <IoIosArrowRoundBack
          size={35}
          className="text-[#ff4d2d] cursor-pointer transition-bounce hover:scale-125 hover:-translate-x-2 active:scale-95 sm:text-3xl"
          onClick={() => navigate("/")}
        />
      </div>
      {/* -------------------------------------------------------------------------------- */}

      <div className="w-full max-w-[900px] bg-white rounded-2xl shadow-xl p-4 sm:p-6 space-y-4 sm:space-y-6 animate-scale-in mt-16 sm:mt-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 animate-fade-in-up">Checkout</h1>

 {/* ---------------------------------location section-------------------------------------------  */}
        <section className="animate-fade-in-up">
          <h2 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2 text-gray-800">
            <FaLocationDot className="text-[#ff4d2d] transition-smooth hover:scale-125" />
            Delivery Location
          </h2>

          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <input
              type="text"
              className="flex-1 border-2 border-gray-300 rounded-xl p-2 sm:p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4d2d] focus:border-transparent transition-smooth-slow"
              placeholder="Enter your Delivery Address..."
              value={addressInput} onChange={(e)=>setAddressInput(e.target.value)}
            />
            <button className="bg-[#ff4d2d] hover:bg-[#e64526] text-white px-4 py-2 sm:py-2.5 rounded-xl flex items-center justify-center cursor-pointer transition-smooth-slow hover:shadow-lg active:scale-95" onClick={getLatLngByAddress}>
              <IoSearchSharp size={18} className="sm:w-5 sm:h-5"/>
            </button>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 sm:py-2.5 rounded-xl flex items-center justify-center cursor-pointer transition-smooth-slow hover:shadow-lg active:scale-95" onClick={getCurrentLocation}>
              <TbCurrentLocation size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
       
             {/*------------ map -------------*/}
             <div className="rounded-xl border-2 border-gray-200 overflow-hidden transition-smooth-slow hover:border-[#ff4d2d] hover:shadow-lg">
             <div className="h-56 sm:h-64 md:h-72 w-full flex items-center justify-center">
             <MapContainer
              className="w-full h-full"
              center={[location?.lat, location.lon]}
              zoom={16}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <RecenterMap location={location} />
              {/* current location marker */}
              <Marker
                position={[location?.lat, location.lon]}
                draggable
                eventHandlers={{ dragend: onDragEnd }}
              />
            </MapContainer>
              </div>
            </div>
         </section>

{/* ---------------------------------Payment section-------------------------------------------  */}
<section className="animate-fade-in-up">
    <h2 className="text-base sm:text-lg font-semibold mb-3 text-gray-800">Payment Method</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">       
                   {/* cash on delivery */}
                  <div className={`flex items-center gap-3 rounded-xl border-2 p-3 sm:p-4 text-left transition-smooth-slow cursor-pointer hover:shadow-lg ${paymentMethod === 'cod'? "border-[#ff4d2d] bg-orange-50 shadow-md scale-105":"border-gray-200 hover:border-gray-300"}`} onClick={()=>setPaymentMethod('cod')}>
                      <span className="inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-green-100"> <MdDeliveryDining  className="text-green-600 text-xl sm:text-2xl"/></span>
                      <div className="flex-1">
                         <p className="font-medium text-gray-800 text-sm sm:text-base">Cash on Delivery</p>
                          <p className="text-xs text-gray-500">pay when your delivery arrives</p>
                      </div>
                  </div>


                  {/* online payment */}
                  <div className={`flex items-center gap-2 sm:gap-3 rounded-xl border-2 p-3 sm:p-4 text-left transition-smooth-slow cursor-pointer hover:shadow-lg ${paymentMethod === 'online'? "border-[#ff4d2d] bg-orange-50 shadow-md scale-105":"border-gray-200 hover:border-gray-300"}`} onClick={()=>setPaymentMethod('online')}>
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-purple-100"><FaMobileScreenButton className="text-purple-700 text-base sm:text-lg"/></span>
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100"><FaCreditCard  className="text-blue-700 text-base sm:text-lg"/></span>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800 text-sm sm:text-base">UPI / Card</p>
                            <p className="text-xs text-gray-500">Pay Securely Online</p>
                          </div>
                  </div>
      </div>
</section>

{/* ---------------------------------Order Summery section-------------------------------------------  */}
<section className="animate-fade-in-up">
  <h2 className="text-base sm:text-lg font-semibold mb-3 text-gray-800">Order Summary</h2>
  <div className="rounded-xl border-2 border-gray-200 bg-gray-50 p-3 sm:p-4 space-y-2 transition-smooth-slow hover:border-[#ff4d2d] hover:shadow-lg">
    {cartItems.map((item,index)=>(
       <div key={index} className="flex justify-between text-sm text-gray-700 transition-smooth hover:text-[#ff4d2d]">
         <span className="flex-1">{item.name} x {item.quantity}</span>
         <span className="font-medium">₹{item.price*item.quantity}</span>

       </div>
    ))}

    <hr className="border-gray-200 my-2"/>
         {/* -----------------subtotal amount----------------- */}
    <div className="flex justify-between font-medium text-gray-800 text-sm sm:text-base">
       <span>Subtotal</span>
       <span>₹{totalAmount}</span>
    </div>
    <div className="flex justify-between text-gray-800 text-sm sm:text-base">
      <span>Delivery Fee</span>
      <span className="font-medium text-green-600">{deliveryFee==0?"Free":`₹${deliveryFee}`}</span>
    </div>

    {/* total amount */}
    <div className="flex justify-between text-base sm:text-lg font-bold text-[#ff4d2d] pt-2 transition-bounce hover:scale-105">
      <span>Total</span>
      <span>₹{AmountWithDeliveryFee}</span>
    </div>

  </div>

</section>

{/* -------------place order button----------------------- */}
<button className="w-full bg-gradient-to-r from-[#ff4d2d] to-[#ff6b4d] hover:from-[#e64526] hover:to-[#e64526] text-white py-3 rounded-xl text-base sm:text-lg font-semibold cursor-pointer transition-smooth-slow hover:scale-105 hover:shadow-2xl active:scale-95 ripple" onClick={handlePlaceOrder}> {paymentMethod=='cod'?'Place Order':'Pay & Place Order'}</button>
       
      </div>
    </div>
  );
};

export default CheckOut;
