import React, { useEffect, useRef, useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { FaUtensils } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { serverUrl } from "../App";
import { setMyShopData } from "../redux/ownerSlice";
import { ClipLoader } from "react-spinners";

const EditItem = () => {
  const navigate = useNavigate();
  const { myShopData } = useSelector((state) => state.owner);

  const {itemId}=useParams()
   const [currentItem, setCurrentItem] = useState(null)
  const [name, setName]= useState("")
  const [price, setPrice] = useState()
  const [category, setCategory] = useState("")
  const [foodType, setFoodType] = useState( "veg")
  const [loading, setLoading] = useState(false)
 
  //categories
  const categories=["Snacks",
        "Main Course",
        "Desserts",
        "Pizza",
        "Burgers",
        "Sandwiches",
        "South Indian",
        "North Indian",
        "Chinese",
        "Fast Food",
        "Others",]

      const [frontendImage, setFrontendImage] = useState( null)
      const [backendImage, setBackendImage] = useState(null)
      const dispatch=useDispatch()
      //handle image function
     const handleImage=(e)=>{
      const file=e.target.files[0]
      setBackendImage(file)
      setFrontendImage(URL.createObjectURL(file))

     }
  
     //handle submit function
     const handleSubmit=async(e)=>{
      e.preventDefault()
      setLoading(true)
         try {
          const formData= new FormData()
          formData.append("name",name)
          formData.append("category",category)
          formData.append("foodType",foodType)
          formData.append("price",price)
          


          if(backendImage){
            formData.append('image',backendImage)
          }
         const result= await axios.post(`${serverUrl}/api/item/edit-item/${itemId}`,formData,{withCredentials:true})
         
         console.log("Item added:", result.data);
         
         // Fetch updated shop data with new item
         const shopResult = await axios.get(`${serverUrl}/api/shop/get-my`, {withCredentials:true})
         dispatch(setMyShopData(shopResult.data))
         setLoading(false)
         navigate('/')

         } catch (error) {
          console.error("Error adding item:", error);
          console.error("Error response:", error.response?.data);
           setLoading(false)
         }
     }

     //getItemById
     useEffect(() => {
       const handleGetItemById= async ()=>{
        try {
            const result= await axios.get(`${serverUrl}/api/item/get-by-id/${itemId}`,{withCredentials:true})
            setCurrentItem(result.data)
        } catch (error) {
            console.log(error);
            
        }
       }
       handleGetItemById()
     
     }, [itemId])

     //current item
     useEffect(() => {
        setName(currentItem?.name || "")
        setPrice(currentItem?.price || 0)
        setCategory(currentItem?.category || "")
        setFoodType(currentItem?.foodType ||"")
        setFrontendImage(currentItem?.image ||"")
    
     }, [currentItem])
     
     

  return (
    <div className="flex justify-center flex-col items-center p-6 bg-gradient-to-br from-orange-50 relative to-white min-h-screen">
      <div className=" absolute top-[20px] left-[20px] z-[10] mb-[10px]">
        <IoIosArrowRoundBack
          size={35}
          className="text-[#ff4d2d] cursor-pointer"
          onClick={() => navigate("/")}
        />
      </div>

      <div className="max-w-lg w-full bg-white shadow-xl rounded-2xl p-8 border border-orange-100">
        <div className="flex flex-col items-center mb-6">
          {/* icon */}
          <div className="bg-orange-100 p-4 rounded-full mb-4">
            <FaUtensils className="text-[#ff4d2d] w-16 h-16"/>
          </div>
          {/* edit/ add shop */}
          <div className="text-3xl font-extrabold text-gray-900">Edit Food</div>
        </div>

        {/* --------------------------------------------form ---------------------------------------------- */}
         <form className="space-y-5" onSubmit={handleSubmit}>
                   {/* name */}
            <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                 <input type="text" placeholder="Enter Item Name" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500" onChange={(e)=>setName(e.target.value)} value={name}/>
            </div>
                       {/* image */}
            <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Food Image</label>
                 <input type="file" accept="image/*" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500" onChange={handleImage}/>
                      {/* show image */}
                {frontendImage && <div className="mt-4">
                    <img src={frontendImage} alt="" className="w-full h-48 object-cover rounded-lg border" />
                  </div>}

                     {/* price */}
            <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                 <input type="number" placeholder="Enter Price" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500" onChange={(e)=>setPrice(e.target.value)} value={price}/>
            </div>
                    {/* select category */}
             <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Select Category</label>
                 <select className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500" onChange={(e)=>setCategory(e.target.value)} value={category}>
                     <option value="">select category</option>
                     {categories.map((cate,index)=>(
                        <option value={cate} key={index}>{cate}</option>
                     ))}
                 </select>
            </div>

             {/* select type */}
             <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Select  Type</label>
                 <select className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500" onChange={(e)=>setFoodType(e.target.value)} value={foodType}>
                       <option value="veg">Veg</option>
                       <option value="non veg">Non Veg</option>

                 </select>
            </div>
            </div>
                   {/* ---------------------------------------------------------------- */}
        

            <button className="w-full bg-[#ff4d2d] text-white px-6 py-3 rounded-lg font-semibold shadow-md active::bg-orange-700 hover:shadow-lg transition-all duration-200 cursor-pointer" disabled={loading}>{loading?<ClipLoader size={20} color="white"/>:"Save"}</button>

         </form>


      </div>
    </div>
  );
};

export default EditItem;
