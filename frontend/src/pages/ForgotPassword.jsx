import React, { useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import axios from 'axios'
import { serverUrl } from "../App";
import { ClipLoader } from 'react-spinners'

const ForgotPassword = () => {

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState()
   const navigate=useNavigate("")
   const [newPassword, setNewPassword] = useState("")
   const [confirmPassword, setConfirmPassword] = useState("")
   const [error, setError] = useState("")
   const [loading, setLoading] = useState(false)
   

  //--------------- functionalities-----------------------------------------------

  // send otp------
  const handleSendOtp= async()=>{
    setLoading(true)
    try {
      
      const result= await axios.post(`${serverUrl}/api/auth/send-otp`,{email},{
        withCredentials:true
      })
       console.log(result);
          setError("")
          setLoading(false)
       setStep(2)
    

    } catch (error) {
      setError(error?.response?.data?.message)
      setLoading(false)
    }
  }

  //verify otp-------------

    const handleVerifyOtp= async()=>{
      setLoading(true)
    try {
      
      const result= await axios.post(`${serverUrl}/api/auth/verify-otp`,{email,otp},{
        withCredentials:true
      })
       console.log(result);
        setError("")
        setLoading(false)
       setStep(3)
       

    } catch (error) {
     setError(error?.response?.data?.message)
     setLoading(false)
    }
  }

    //reset passsword-------------

    const handleResetPassword= async()=>{
      
      if(newPassword!=confirmPassword){
        return null
      }
      setLoading(true)
    try {
      
      const result= await axios.post(`${serverUrl}/api/auth/reset-password`,{email,newPassword},{
        withCredentials:true
      })
       console.log(result);
        setError("")
        setLoading(false)
      navigate('/signin')
      
    } catch (error) {
      setError(error?.response?.data?.message)
      setLoading(false)
    }
  }


  return (
    <div className="flex w-full items-center justify-center min-h-screen p-4 bg-[#fff9f6] animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8 animate-scale-in transition-smooth-slow hover:shadow-3xl border border-gray-100">
        <div className="flex items-center gap-3 sm:gap-4 mb-6 animate-fade-in-down">
          <IoIosArrowRoundBack 
            size={30} 
            className="text-[#ff4d2d] cursor-pointer transition-bounce hover:scale-125 hover:-translate-x-2 active:scale-95" 
            onClick={()=>navigate('/signin')} 
          />
          <h1 className="text-[#ff4d2d] text-xl sm:text-2xl font-bold">Forgot Password</h1>
        </div>

        {/* step 1 email*/}
        {step == 1 && (
          <div className="animate-fade-in-up">
            {/* //email */}
            <div className="mb-6">
              <label
                htmlFor="email"
                className="block text-gray-700 font-medium mb-2 text-sm sm:text-base"
              >
                Email Address
              </label>
              <input
                type="email"
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 sm:py-2.5 focus:outline-none focus:border-[#ff4d2d] transition-smooth-slow text-sm sm:text-base"
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
                value={email} required
              />
            </div>
              {/* forgot password button */}
          <button
            className={`w-full font-semibold py-2 sm:py-2.5 rounded-xl transition-smooth-slow bg-gradient-to-r from-[#ff4d2d] to-[#ff6b4d] text-white hover:shadow-2xl hover:scale-105 cursor-pointer active:scale-95 text-sm sm:text-base ripple`}
            onClick={handleSendOtp} disabled={loading}
            >  {loading?<ClipLoader color="white" size={20}/>:"Send OTP"}</button>
                    {/* display errors  */}
            {error &&  <p className="text-red-500 text-center my-3 text-sm animate-shake">{error}</p>} 
          </div>
        )}

        {/* step 2 otp */}
 
            {step == 2 && (
          <div className="animate-fade-in-up">
            {/* //Enter OTP */}
            <div className="mb-6">
              <label
                htmlFor="enter OTP"
                className="block text-gray-700 font-medium mb-2 text-sm sm:text-base"
              >
                Enter OTP
              </label>
              <input
                type="text"
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 sm:py-2.5 focus:outline-none focus:border-[#ff4d2d] transition-smooth-slow text-center text-lg tracking-widest font-semibold"
                placeholder="000000"
                onChange={(e) => setOtp(e.target.value)}
                value={otp} required
                maxLength="6"
              />
              <p className="text-xs text-gray-500 mt-2 text-center">Please check your email for the OTP</p>
            </div>
              {/* forgot password button */}
          <button
            className={`w-full font-semibold py-2 sm:py-2.5 rounded-xl transition-smooth-slow bg-gradient-to-r from-[#ff4d2d] to-[#ff6b4d] text-white hover:shadow-2xl hover:scale-105 cursor-pointer active:scale-95 text-sm sm:text-base ripple`}
            onClick={handleVerifyOtp} disabled={loading}
            >{loading?<ClipLoader color="white" size={20}/>:"Verify OTP"}</button>
                    {/* display errors  */}
            {error &&  <p className="text-red-500 text-center my-3 text-sm animate-shake">{error}</p>} 
          </div>
        )}

        {/* step 3 reset password*/}
 
            {step == 3 && (
          <div className="animate-fade-in-up">
            {/* //Change Password */}
            <div className="mb-4">
              <label
                htmlFor="new password"
                className="block text-gray-700 font-medium mb-2 text-sm sm:text-base"
              >
                New Password
              </label>
              <input
                type="password"
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 sm:py-2.5 focus:outline-none focus:border-[#ff4d2d] transition-smooth-slow text-sm sm:text-base"
                placeholder="Enter New Password"
                onChange={(e) => setNewPassword(e.target.value)}
                value={newPassword} required
              />
            </div>

             <div className="mb-6">
              <label
                htmlFor="confirmPassword"
                className="block text-gray-700 font-medium mb-2 text-sm sm:text-base"
              >
                Confirm Password
              </label>
              <input
                type="password"
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 sm:py-2.5 focus:outline-none focus:border-[#ff4d2d] transition-smooth-slow text-sm sm:text-base"
                placeholder="Confirm Password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                value={confirmPassword} required
              />
              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
              )}
            </div>
              {/* forgot password button */}
          <button
            className={`w-full font-semibold py-2 sm:py-2.5 rounded-xl transition-smooth-slow bg-gradient-to-r from-[#ff4d2d] to-[#ff6b4d] text-white hover:shadow-2xl hover:scale-105 cursor-pointer active:scale-95 text-sm sm:text-base ripple ${newPassword !== confirmPassword ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleResetPassword} disabled={loading || newPassword !== confirmPassword}
            >{loading?<ClipLoader color="white" size={20}/>:"Reset Password"}</button>
                    {/* display errors  */}
            {error &&  <p className="text-red-500 text-center my-3 text-sm animate-shake">{error}</p>} 
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
