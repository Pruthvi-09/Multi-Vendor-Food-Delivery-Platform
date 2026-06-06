import React, { useState } from "react";
import { FaRegEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase";
import { ClipLoader } from 'react-spinners'
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
const SignUp = () => {
  const navigate = useNavigate();
  const dispatch=useDispatch();

  const primaryColor = "#ff4d2d";
  const hoverColor = "#e64323";
  const bgColor = "#fff9f6";
  const borderColor = "#ddd";

  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("user");
  const [fullname, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  //   ---------------------signup function---------------------
  const handleSignUp = async () => {
     setLoading(true)
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/signup`,
        {
          fullname,
          email,
          password,
          mobile,
          role,
        },
        { withCredentials: true },
      );
      dispatch(setUserData(result.data.data))
      setError("")
      setLoading(false)
      navigate('/')
    } catch (error) {
      setError(error?.response?.data?.message)
       setLoading(false)
    }
  };

  //----------------------googleAuth function---------------------

  const handleGoogleAuth = async () => {
    if (!mobile) {
      return setError("mobile number is required");
    }
    
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log(result);

      const {data} = await axios.post(
        `${serverUrl}/api/auth/google-auth`,
        { fullname:result.user.displayName,
           email:result.user.email , 
           mobile,
            role 
          },
        { withCredentials: true }, 
      );
      dispatch(setUserData(data.data))
      navigate('/')
    } catch (error) {
        console.log(error);
        setError(error?.response?.data?.message || "Google sign up failed")
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 animate-fade-in"
      style={{ backgroundColor: bgColor }}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8 border-[1px] animate-scale-in transition-smooth-slow hover:shadow-3xl`}
        style={{ border: ` 1px solid ${borderColor}` }}
      >
        <h1
          className={`text-2xl sm:text-3xl font-bold mb-2 animate-bounce-in`}
          style={{ color: primaryColor }}
        >
          QuickBite
        </h1>
        <p className="text-gray-600 text-sm sm:text-base mb-6 sm:mb-8 animate-fade-in-up">
          Create your account to get started with delicious food deliveries
        </p>

        {/* //fullname */}
        <div className="mb-4 animate-fade-in-left">
          <label
            htmlFor="fullname"
            className="block text-gray-700 font-medium mb-1 text-sm sm:text-base"
          >
            Full Name
          </label>
          <input
            type="text"
            className="w-full border-2 rounded-xl px-3 py-2 sm:py-2.5 focus:outline-none focus:border-[#ff4d2d] transition-smooth-slow text-sm sm:text-base"
            placeholder="Enter your fullname"
            style={{ border: ` 2px solid ${borderColor}` }}
            onChange={(e) => setFullName(e.target.value)}
            value={fullname} required
          />
        </div>

        {/* //email */}
        <div className="mb-4 animate-fade-in-right">
          <label
            htmlFor="email"
            className="block text-gray-700 font-medium mb-1 text-sm sm:text-base"
          >
            Email
          </label>
          <input
            type="email"
            className="w-full border-2 rounded-xl px-3 py-2 sm:py-2.5 focus:outline-none focus:border-[#ff4d2d] transition-smooth-slow text-sm sm:text-base"
            placeholder="Enter your email"
            style={{ border: ` 2px solid ${borderColor}` }}
            onChange={(e) => setEmail(e.target.value)}
            value={email} required
          />
        </div>

        {/* //mobile */}
        <div className="mb-4 animate-fade-in-left">
          <label
            htmlFor="mobile"
            className="block text-gray-700 font-medium mb-1 text-sm sm:text-base"
          >
            Mobile
          </label>
          <input
            type="text"
            className="w-full border-2 rounded-xl px-3 py-2 sm:py-2.5 focus:outline-none focus:border-[#ff4d2d] transition-smooth-slow text-sm sm:text-base"
            placeholder="Enter your Mobile"
            style={{ border: ` 2px solid ${borderColor}` }}
            onChange={(e) => setMobile(e.target.value)}
            value={mobile} required
          />
        </div>

        {/* //password */}
        <div className="mb-4 animate-fade-in-right">
          <label
            htmlFor="password"
            className="block text-gray-700 font-medium mb-1 text-sm sm:text-base"
          >
            Password
          </label>

          <div className="relative">
            <input
              type={`${showPassword ? "text" : "password"}`}
              className="w-full border-2 rounded-xl px-3 py-2 sm:py-2.5 focus:outline-none focus:border-[#ff4d2d] transition-smooth-slow text-sm sm:text-base"
              placeholder="Enter your Password"
              style={{ border: ` 2px solid ${borderColor}` }}
              onChange={(e) => setPassword(e.target.value)}
              value={password} required
            />
            <button
              className="absolute right-3 cursor-pointer top-[10px] sm:top-[14px] text-gray-500 transition-smooth-slow hover:text-[#ff4d2d] hover:scale-125"
              onClick={() => {
                setShowPassword((prev) => !prev);
              }}
            >
              {showPassword ? <FaRegEye /> : <FaEyeSlash />}
            </button>
          </div>
        </div>

        {/* //role */}
        <div className="mb-4 animate-fade-in-up">
          <label
            htmlFor="role"
            className="block text-gray-700 font-medium mb-2 text-sm sm:text-base"
          >
            Role
          </label>

          <div className="flex flex-col sm:flex-row gap-2">
            {["user", "owner", "deliveryBoy"].map((r) => (
              <button
                key={r}
                className="flex-1 border-2 rounded-xl px-3 py-2 sm:py-2.5 text-center font-medium transition-smooth-slow cursor-pointer text-sm sm:text-base hover:scale-105 active:scale-95"
                onClick={() => setRole(r)}
                style={
                  role == r
                    ? { backgroundColor: primaryColor, color: "white" }
                    : { border: `2px solid ${primaryColor}`, color: "#333" }
                }
              >
                {r === "deliveryBoy" ? "Delivery Boy" : r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* singUp Button */}
        <button
          className={`w-full font-semibold py-2 sm:py-2.5 rounded-xl transition-smooth-slow bg-gradient-to-r from-[#ff4d2d] to-[#ff6b4d] text-white hover:shadow-2xl hover:scale-105 cursor-pointer active:scale-95 text-sm sm:text-base ripple`}
          onClick={handleSignUp} disabled={loading}
          >
          {loading?<ClipLoader size={20} color="#fff"/>:"Sign Up"}
        </button>
             {/* display errors  */}
            {error &&  <p className="text-red-500 text-center my-[10px] text-sm animate-shake">{error}</p>} 

        {/* Google Button */}

        <button
          className="w-full mt-4 flex items-center justify-center gap-2 border-2 rounded-xl px-4 py-2 sm:py-2.5 transition-smooth-slow border-gray-300 hover:border-[#ff4d2d] hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer text-sm sm:text-base"
          onClick={handleGoogleAuth}
        >
          <FcGoogle size={20} className="transition-smooth hover:rotate-12" />
          <span>Sign up with Google</span>
        </button>

        <p className="mt-6 text-center text-sm sm:text-base animate-fade-in-up">
          Already have an account?{" "}
          <span
            className="text-[#ff4d2d] font-bold cursor-pointer transition-smooth-fast hover:underline hover:scale-105 inline-block"
            onClick={() => navigate("/signin")}
          >
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
