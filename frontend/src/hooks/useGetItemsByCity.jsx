import { useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setMyShopData } from "../redux/ownerSlice";
import { setItemsInMyCity, setShopsInMyCity } from "../redux/userSlice";

const useGetItemsByCity = () => {
   const {currentCity}=useSelector(state=>state.user) 
  const dispatch= useDispatch()
  useEffect(() => {
    if(!currentCity) return; // Don't fetch if city not set yet
    
    const fetchItems = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/item/get-by-city/${currentCity}`, {
          withCredentials: true,
        });

        dispatch(setItemsInMyCity(result.data))
        console.log("Items fetched:", result.data);
        
      } catch (error) {
        if (error.response && (error.response.status === 401 || error.response.status === 400 || error.response.status === 404)) {
          // No items found
          dispatch(setItemsInMyCity([]))
          return;
        }
        console.error("Error fetching items:", error);
      }
    };

    fetchItems();
  }, [currentCity]);
};

export default useGetItemsByCity;
