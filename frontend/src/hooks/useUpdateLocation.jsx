import { useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../redux/userSlice";

const useUpdateLocation = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector(state => state.user);
  const userId = userData?._id;
  
  useEffect(() => {
    if (!userId) return;

    const updateLocation = async (lat, lon) => {
        if (lat === undefined || lon === undefined || lat === null || lon === null) return;
        try {
            const result = await axios.post(`${serverUrl}/api/user/update-location`, { lat, lon }, { withCredentials: true });
            console.log(result.data);
            if (result.data.user) {
                dispatch(setUserData(result.data.user));
            }
        } catch (error) {
            // Silently ignore location update errors but log it for debugging
            console.error("Location Update Failed:", error.response?.data || error.message);
        }
    };

    //--------- to watch current user location---------------
    const watchId = navigator.geolocation.watchPosition((pos) => {
        updateLocation(pos.coords.latitude, pos.coords.longitude);
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [userId, dispatch]);
  
};

export default useUpdateLocation;
