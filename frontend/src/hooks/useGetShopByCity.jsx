import { useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setMyShopData } from "../redux/ownerSlice";
import { setShopsInMyCity } from "../redux/userSlice";

const useGetShopByCity = () => {
   const {currentCity}=useSelector(state=>state.user) 
  const dispatch= useDispatch()
  useEffect(() => {
    if(!currentCity) return; // Don't fetch if city not set yet
    
    const fetchShops = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/shop/get-by-city/${currentCity}`, {
          withCredentials: true,
        });

        dispatch(setShopsInMyCity(result.data))
        console.log("Shops fetched:", result.data);
        
      } catch (error) {
        if (error.response && (error.response.status === 401 || error.response.status === 400 || error.response.status === 404)) {
          // No shop found or not authenticated
          dispatch(setShopsInMyCity([]))
          return;
        }
        console.error("Error fetching shops:", error);
      }
    };

    fetchShops();
  }, [currentCity]);
};

export default useGetShopByCity;
