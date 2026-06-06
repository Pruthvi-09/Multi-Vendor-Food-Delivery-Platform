import React from "react";
import { useState } from "react";
import { FaLeaf } from "react-icons/fa";
import { FaDrumstickBite } from "react-icons/fa";
import { FaStar } from "react-icons/fa";
import { FaRegStar } from "react-icons/fa";
import { FaMinus } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import { FaShoppingCart } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/userSlice";

const FoodCard = ({ data }) => {
  const [quantity, setQuantity] = useState(0);
  const dispatch = useDispatch();
  const{cartItems}=useSelector(state=>state.user)

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= rating ? (
          <FaStar className="text-yellow-500 text-lg" />
        ) : (
          <FaRegStar className="text-yellow-500 text-lg" />
        ),
      );
    }
    return stars;
  };

  //------set quantity increase button----------------------
  const handleIncrease = () => {
    const newQty = quantity + 1;
    setQuantity(newQty);
  };
  //------set quantity decrease button----------------------
  const handleDecrease = () => {
    if (quantity > 0) {
      const newQty = quantity - 1;
      setQuantity(newQty);
    }
  };

  return (
    <div className="w-full sm:w-[250px] rounded-2xl border-2 border-[#ff4d2d] bg-white shadow-md overflow-hidden transition-smooth-slow hover:shadow-2xl hover:-translate-y-2 hover-glow flex flex-col group">
      {/* ---------------------image------------------------------- */}
      <div className="relative w-full h-[170px] flex justify-center items-center bg-white overflow-hidden">
        <div className="absolute top-3 right-3 bg-white rounded-full p-1 shadow-lg z-10 transition-bounce hover:scale-125 animate-bounce-in">
          {/* veg&nonveg */}
          {data.foodType == "veg" ? (
            <FaLeaf className="text-green-800 text-lg" />
          ) : (
            <FaDrumstickBite className="text-red-800 text-lg" />
          )}
        </div>
        <img
          src={data.image}
          alt={data.name}
          className="w-full h-full object-cover transition-smooth-slower group-hover:scale-110 group-hover:rotate-1"
        />
      </div>

      {/* ------------------------content---------------------------- */}
      <div className="flex-1 flex flex-col p-4">
        <h1 className="font-semibold text-gray-900 text-base truncate transition-smooth group-hover:text-[#ff4d2d]">
          {data.name}
        </h1>
        {/* rating */}
        <div className="flex items-center gap-1 mt-1">
          {renderStars(data.rating?.average || 0)}
          <span className="text-xs text-gray-500 transition-smooth group-hover:text-gray-700">
            {data.rating?.count || 0}
          </span>
        </div>
        {/* price  */}
        <div className="flex items-center justify-between mt-auto pt-3">
          <span className="font-bold text-gray-900 text-lg transition-bounce hover:scale-110">
            ₹{data.price}
          </span>

          <div className="flex items-center border-2 border-gray-200 rounded-full overflow-hidden shadow-sm transition-smooth hover:border-[#ff4d2d] hover:shadow-md">
            <button
              className="px-2 py-1 hover:bg-[#ff4d2d] hover:text-white transition-smooth-fast active:scale-90"
              onClick={handleDecrease}
            >
              <FaMinus size={12} />
            </button>
            <span className="px-2 font-medium">{quantity}</span>
            <button
              className="px-2 py-1 hover:bg-[#ff4d2d] hover:text-white transition-smooth-fast active:scale-90"
              onClick={handleIncrease}
            >
              <FaPlus size={12} />
            </button>
            {/* cart button */}
            <button
              className={`${cartItems.some(i=>i.id==data._id)?"bg-gray-800":"bg-[#ff4d2d]"} text-white px-2.5 py-2 transition-smooth hover:brightness-110 active:scale-90 ripple`}
              onClick={() =>
              {quantity>0?
                dispatch(
                  addToCart({
                    id: data._id,
                    name: data.name,
                    price: data.price,
                    image: data.image,
                    shop: data.shop,
                    quantity,
                    foodType: data.foodType,
                  }),
                ):"null"
              }
              }
            >
              <FaShoppingCart size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
