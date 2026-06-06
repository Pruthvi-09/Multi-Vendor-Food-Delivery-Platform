import { useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setMyShopData } from "../redux/ownerSlice";

const getMyShop = () => {
  const dispatch= useDispatch()
  const {userData}=useSelector(state=>state.user)
  useEffect(() => {
    const fetchShop = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/shop/get-my`, {
          withCredentials: true,
        });

        dispatch(setMyShopData(result.data))
      } catch (error) {
        if (error.response && (error.response.status === 401 || error.response.status === 400 || error.response.status === 404)) {
          // No shop found or not authenticated
          dispatch(setMyShopData(null))
          return;
        }
        console.log(error);
      }
    };

    fetchShop();
  }, [userData?._id, dispatch]);
};

export default getMyShop;
