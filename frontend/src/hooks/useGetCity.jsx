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
      console.log("Using saved location:", savedCity)
    }
    
    const getLocation = async () => {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        console.error("Geolocation is not supported by this browser")
        alert("Location services are not supported by your browser. Please use a modern browser.")
        return
      }

      // Check if we're on HTTPS (required for mobile browsers)
      const isSecure = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1'
      if (!isSecure) {
        console.error("Geolocation requires HTTPS. Current protocol:", location.protocol)
        alert("Location services require a secure connection (HTTPS). Please ensure your site is served over HTTPS.")
        return
      }
      
      console.log("Starting location request...", {
        protocol: location.protocol,
        hostname: location.hostname,
        isSecure
      })

      try {
        // Request permission and get location
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
              
              console.log('Geocoding response:', result.data);
              
              if(result.data?.results?.[0]) {
                const locationData = result.data.results[0]
                // Try different fields for city name (mobile may return different structure)
                const cityName = locationData.county || 
                                locationData.city || 
                                locationData.state_district?.replace(" District", "") ||
                                locationData.town ||
                                locationData.village ||
                                "Unknown City"
                                
                const stateName = locationData.state || ""
                const address = locationData.formatted || ""
                
                // Save to localStorage for next time
                localStorage.setItem('userCity', cityName)
                localStorage.setItem('userState', stateName)
                localStorage.setItem('userAddress', address)
                
                dispatch(setCurrentCity(cityName))
                dispatch(setCurrnetState(stateName)) 
                dispatch(setCurrentAddress(address))
                dispatch(setAddress(address))
                
                console.log("Location updated successfully:", cityName)
              } else {
                console.error("No results from geocoding API")
              }
              
            } catch (error) {
              console.error("Geocoding API error:", error)
              alert("Unable to fetch location details. Please try again.")
            }
          },
          (error) => {
            // Handle different error codes
            let errorMessage = "Unable to retrieve your location. "
            let detailedLog = ""
            
            switch(error.code) {
              case error.PERMISSION_DENIED:
                errorMessage += "Please allow location access in your browser settings."
                detailedLog = "User denied location permission"
                break
              case error.POSITION_UNAVAILABLE:
                errorMessage += "Location information is unavailable. Please check your device's location settings."
                detailedLog = "Location unavailable - GPS may be off"
                break
              case error.TIMEOUT:
                errorMessage += "Location request timed out. Please try again."
                detailedLog = "Location timeout after 15 seconds"
                break
              default:
                errorMessage += "An unknown error occurred."
                detailedLog = `Unknown location error: ${error.message}`
            }
            
            console.error("Geolocation error:", {
              code: error.code,
              message: error.message,
              detailedLog
            })
            
            // Only show alert if no saved location
            if(!savedCity) {
              alert(errorMessage + "\n\nNote: You may need to:\n1. Enable location services on your device\n2. Allow location access for this website\n3. Check if you have a stable internet connection")
            } else {
              console.log("Using saved location due to error:", savedCity)
            }
          },
          {
            enableHighAccuracy: true, // Use GPS for accurate location (important for mobile)
            timeout: 20000, // 20 second timeout (longer for mobile networks)
            maximumAge: 0 // Don't use cached position (get fresh location)
          }
        )
      } catch (error) {
        console.error("Location error:", error)
        if(!savedCity) {
          alert("Unable to access location services. Please check your browser settings.")
        }
      }
    }
    
    // Add a small delay to ensure proper initialization on mobile
    const timer = setTimeout(() => {
      getLocation()
    }, 500)

    return () => clearTimeout(timer)
    
  }, [userData?._id, dispatch, apikey])
  
};

export default useGetCity;
