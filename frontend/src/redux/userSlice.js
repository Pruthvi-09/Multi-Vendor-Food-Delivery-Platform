import { createSlice, current } from "@reduxjs/toolkit";

 const userSlice= createSlice({
    name:"user",
    initialState:{
        userData:null,
        currentCity:null,
        currentState:null,
        currentAddress:null,
        shopInMyCity:null,
        itemsInMyCity:null,
        cartItems:[],
        totalAmount:0,
        myOrders:[],
        searchItems:null,
        socket:null
    },
    reducers:{
        setUserData:(state,action)=>{
           state.userData=action.payload
        },
        setCurrentCity:(state,action)=>{
           state.currentCity=action.payload
        },
        setCurrnetState:(state,action)=>{
           state.currentState=action.payload
        },
         setCurrentAddress:(state,action)=>{
           state.currentAddress=action.payload
        },
         setShopsInMyCity:(state,action)=>{
           state.shopsInMyCity=action.payload
        },
        setItemsInMyCity:(state,action)=>{
           state.itemsInMyCity=action.payload
        },
        setSocket:(state,action)=>{
           state.socket=action.payload
        },
        addToCart:(state,action)=>{
            const cartItem=action.payload
            const existingItem=state.cartItems.find(i=>i.id==cartItem.id)    
            if(existingItem){
                  existingItem.quantity+=cartItem.quantity
            }  
            else{
               state.cartItems.push(cartItem)
            }

            state.totalAmount=state.cartItems.reduce((sum,i)=>sum+i.price*i.quantity,0)
        },

        updateQuantity:(state,action)=>{
           const {id,quantity}=action.payload
           const item=state.cartItems.find(i=>i.id==id)
           if(item){
            item.quantity=quantity
           }
          state.totalAmount=state.cartItems.reduce((sum,i)=>sum+i.price*i.quantity,0)

        },

            removeCartItem:(state,action)=>{
            state.cartItems=state.cartItems.filter(i=>i.id!==action.payload)
            state.totalAmount=state.cartItems.reduce((sum,i)=>sum+i.price*i.quantity,0)

        },
        clearCart:(state)=>{
            state.cartItems=[]
            state.totalAmount=0
        },
        setMyOrders:(state,action)=>{
         state.myOrders=action.payload
        },
        addMyOrders:(state,action)=>{
         state.myOrders=[action.payload,...state.myOrders]
        },
      setSearchItems:(state,action)=>{
         state.searchItems=action.payload
      },
      updateRealtimeOrderStatus:(state,action)=>{
         const{orderId,shopId,status}=action.payload
         const order=state.myOrders.find(o => o._id == orderId)
         if(order){
            const shopOrder=order.shopOrders?.find(so => (so.shop?._id || so.shop) == shopId)
            if(shopOrder){
               shopOrder.status = status
            }
         }
      },
      updateShopOrderInState:(state,action)=>{
         const{orderId,shopOrder}=action.payload
         const order=state.myOrders.find(o => o._id == orderId)
         if(order){
            const index = order.shopOrders?.findIndex(so => {
               const soId = so.shop?._id || so.shop;
               const targetId = shopOrder.shop?._id || shopOrder.shop;
               return String(soId) === String(targetId);
             });
             if(index !== undefined && index !== -1){
                order.shopOrders[index] = shopOrder;
             }
         }
      }




    }
 })

 export const 
 {setUserData,setSearchItems,addMyOrders,setMyOrders,setCurrentCity,
   setCurrnetState,setCurrentAddress,setShopsInMyCity,setItemsInMyCity,
   addToCart,updateQuantity,removeCartItem,clearCart,setSocket,updateRealtimeOrderStatus,updateShopOrderInState}=userSlice.actions
 export default userSlice.reducer