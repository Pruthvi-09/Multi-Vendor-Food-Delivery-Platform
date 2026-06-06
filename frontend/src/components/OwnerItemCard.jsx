import axios from 'axios';
import React from 'react'
import { FaPen } from "react-icons/fa";
import { FaTrashAlt } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';
import { setMyShopData } from '../redux/ownerSlice';

const OwnerItemCard = ({data}) => {
  const navigate= useNavigate()
  const dispatch = useDispatch()
  const { myShopData } = useSelector(state => state.owner)

  //----------------- delete function---------------
 const handleDelete= async()=>{
  try {
    await axios.delete(`${serverUrl}/api/item/delete/${data._id}`,{withCredentials:true})
    
    // Update Redux state by removing the deleted item
    if(myShopData){
      const updatedShop = {
        ...myShopData,
        items: myShopData.items.filter(item => item._id !== data._id)
      }
      dispatch(setMyShopData(updatedShop))
    }
    
    console.log("Item deleted successfully")
  } catch (error) {
    console.error("Delete error:", error);
  }
 }

  return (
    <div className='flex bg-white rounded-lg shadow-md overflow-hidden border border-[#ff4d2d] w-full max-w-2xl'>
           {/* item image */}
        <div className='w-36  shrink-0 bg-gray-50'>
            <img src={data.image} alt=""  className='w-full h-full object-cover'/>
        </div>
         {/* name,category, type */}
         <div className='flex flex-col justify-between p-3 flex-1'>
                 {/* part1 */}
                 <div>
                       <h2 className='text-2xl font-bold text-[#ff4d2d]'>{data.name}</h2>
                       <p><span className='font-medium text-gray-70'>Category:</span>{data.category}</p>
                       <p><span className='font-medium text-gray-70'>Food Type:</span>{data.foodType}</p>
                 </div>

                 {/* part 2 */}
                 <div className='flex items-center justify-between'>
                    {/* price */}
                     <div className='text-[#ff4d2d] font-bold'>{data.price}₹</div>
                     {/* edit/trash */}
                     <div className='flex items-center gap-3'>
                               <div className='p-2 rounded-full hover:bg-[#ff4d2d]/10 text-[#ff4d2d] cursor-pointer' onClick={()=>navigate(`/edit-item/${data._id}`)}><FaPen size={21}/></div>
                               <div className='p-2 rounded-full hover:bg-[#ff4d2d]/10 text-[#ff4d2d] cursor-pointer' onClick={handleDelete}><FaTrashAlt size={21}/></div>
                     </div>
                     
                      
                 </div>
         </div>

    </div>
  )
}

export default OwnerItemCard