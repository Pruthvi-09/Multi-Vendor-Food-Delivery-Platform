import { useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setMyShopData } from "../redux/ownerSlice";
import { setMyOrders } from "../redux/userSlice";

const useGetMyOrders = () => {
  const dispatch= useDispatch()
  const {userData}=useSelector(state=>state.user)
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/order/my-orders`, {
          withCredentials: true,
        });
        dispatch(setMyOrders(result.data))
        console.log(result.data);
        
      } catch (error) {
        if (error.response && (error.response.status === 401 || error.response.status === 400 || error.response.status === 404)) {
          // No shop found or not authenticated
          dispatch(setMyShopData(null))
          return;
        }
        console.log(error);
      }
    };

    fetchOrders();
  }, [userData?._id, dispatch]);
};

export default useGetMyOrders;
