import { useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

const useGetCurrentUser = () => {
  const dispatch= useDispatch()
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/user/current`, {
          withCredentials: true,
        });

        dispatch(setUserData(result.data))
      } catch (error) {
        if (error.response && (error.response.status === 401 || error.response.status === 400)) {
          // Token not found, user is not authenticated.
          return;
        }
        console.log(error);
      }
    };

    fetchUser();
  }, []);
};

export default useGetCurrentUser;
