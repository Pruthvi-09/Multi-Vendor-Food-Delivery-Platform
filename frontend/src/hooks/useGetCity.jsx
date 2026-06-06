import { useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import {  setCurrentAddress, setCurrentCity, setCurrnetState, setUserData } from "../redux/userSlice";
import { setAddress, setLocation } from "../redux/mapSlice";

const useGetCity = () => {
  const dispatch= useDispatch()
  const {userData}= useSelector(state=>state.user)
  const apikey= import.meta.env.VITE_GEOAPIKEY
  
  useEffect(() => {
    // Check if city is already in localStorage
    const savedCity = localStorage.getItem('userCity')
    const savedState = localStorage.getItem('userState')
    const savedAddress = localStorage.getItem('userAddress')
    
    if(savedCity) {
      // Use saved city immediately (instant load)
      dispatch(setCurrentCity(savedCity))
      dispatch(setCurrnetState(savedState)) 
      dispatch(setCurrentAddress(savedAddress))
      // console.log("Using saved location:", savedCity)
    }
    
    const getLocation = async () => {
      try {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const latitude = position.coords.latitude
              const longitude = position.coords.longitude
              const accuracy = position.coords.accuracy
              
              console.log('GPS Coordinates:', {
                latitude,
                longitude,
                accuracy: `${accuracy} meters`
              })
              
              dispatch(setLocation({lat:latitude,lon:longitude}))
              const result = await axios.get(
                `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apikey}`
              )
              
                 console.log('addresssssssssssss',result.data);
             // const cityName = result.data.results[0].state_district.replace(" District", "")
              const cityName = result.data.results[0].county
              const stateName = result.data.results[0].state
              const address = result.data.results[0].formatted
              
              // Save to localStorage for next time
              localStorage.setItem('userCity', cityName)
              localStorage.setItem('userState', stateName)
              localStorage.setItem('userAddress', address)
              
              dispatch(setCurrentCity(cityName))
              dispatch(setCurrnetState(stateName)) 
              dispatch(setCurrentAddress(address))
              dispatch(setAddress(result.data.results[0].formatted))
              
           
              
              // console.log("Location updated:", cityName)
            } catch (error) {
              console.error("Geocoding error:", error)
            }
          },
          (error) => {
            console.error("Geolocation error:", error)
          },
          {
            enableHighAccuracy: true, // Use GPS for accurate location
            timeout: 10000, // 10 second timeout  
            maximumAge: 60000 // Cache for 1 minute
          }
        )
      } catch (error) {
        console.error("Location error:", error)
      }
    }
    
    getLocation()
  }, [userData?._id, dispatch, apikey])
  
};

export default useGetCity;
