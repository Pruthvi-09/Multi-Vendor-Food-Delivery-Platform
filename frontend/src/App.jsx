import { useState } from 'react'

import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import ForgotPassword from './pages/ForgotPassword'
import useGetCurrentUser from './hooks/useGetCurrentUser'
import { useDispatch, useSelector } from 'react-redux'
import Home from './pages/Home'
import useGetCity from './hooks/useGetCity'
import getMyShop from './hooks/getMyShop'
import CreateEditShop from './pages/CreateEditShop'
import AddItem from './pages/AddItem'
import EditItem from './pages/EditItem'
import useGetShopByCity from './hooks/useGetShopByCity'
import useGetItemsByCity from './hooks/useGetItemsByCity'
import CartPage from './pages/CartPage'
import CheckOut from './pages/CheckOut'
import OrderPlaced from './pages/OrderPlaced'
import MyOrders from './pages/MyOrders'
import useGetMyOrders from './hooks/useGetMyOrders'
import useUpdateLocation from './hooks/useUpdateLocation'
import TrackOrderPage from './pages/TrackOrderPage'
import Shop from './pages/Shop'
import { useEffect } from 'react'
import { io } from 'socket.io-client'
import { setSocket, addMyOrders, updateRealtimeOrderStatus, updateShopOrderInState } from './redux/userSlice'
export const serverUrl="https://quickbite-backend-8nj2.onrender.com"

function App() {
   const {userData}=useSelector(state=>state.user)
   const dispatch=useDispatch()

  useUpdateLocation()
  useGetMyOrders()
  useGetCurrentUser()
  useGetCity()
  getMyShop()
  useGetShopByCity()
  useGetItemsByCity()
    
  useEffect(() => {
    const socketInstance=io(serverUrl,{withCredentials:true})
    dispatch(setSocket(socketInstance))
    socketInstance.on('connect',()=>{
     if(userData){
       socketInstance.emit('identity',{userId:userData._id})
     }
    })

    const handleNewOrder = (data) => {
      if (userData && data.shopOrders[0]?.owner?._id === userData._id) {
        dispatch(addMyOrders(data))
      }
    };

    const handleOrderStatusUpdate = (data) => {
      dispatch(updateRealtimeOrderStatus(data))
    };

    const handleShopOrderUpdate = (data) => {
      dispatch(updateShopOrderInState(data))
    };

    socketInstance.on('newOrder', handleNewOrder);
    socketInstance.on('orderStatusUpdate', handleOrderStatusUpdate);
    socketInstance.on('shopOrderUpdate', handleShopOrderUpdate);

    return ()=>{
      socketInstance.off('newOrder', handleNewOrder);
      socketInstance.off('orderStatusUpdate', handleOrderStatusUpdate);
      socketInstance.off('shopOrderUpdate', handleShopOrderUpdate);
      socketInstance.disconnect()
    }
  }, [userData?._id, dispatch, userData])
  

  return (
    <>
    <div className="animate-fade-in">
    <Routes>
         <Route path='/signup' element={!userData?<SignUp/>:<Navigate to={'/'}/>} />
         <Route path='/signin' element={!userData?<SignIn/>:<Navigate to={'/'}/>} />
         <Route path='/forgot-password' element={!userData?<ForgotPassword/>:<Navigate to={'/'}/>} />
         <Route path='/' element={userData?<Home/>: <Navigate to={'/signin'}/>} />
         <Route path='/create-edit-shop' element={userData?<CreateEditShop/>: <Navigate to={'/signin'}/>} />
         <Route path='/add-item' element={userData?<AddItem/>: <Navigate to={'/signin'}/>} />
         <Route path='/edit-item/:itemId' element={userData?<EditItem/>: <Navigate to={'/signin'}/>} />
         <Route path='/cart' element={userData?<CartPage/>: <Navigate to={'/signin'}/>} />
         <Route path='/checkout' element={userData?<CheckOut/>: <Navigate to={'/signin'}/>} />
         <Route path='/order-placed' element={userData?<OrderPlaced/>: <Navigate to={'/signin'}/>} />
         <Route path='/my-orders' element={userData?<MyOrders/>: <Navigate to={'/signin'}/>} />
         <Route path='/track-order/:orderId' element={userData?<TrackOrderPage/>: <Navigate to={'/signin'}/>} />
         <Route path='/shop/:shopId' element={userData?<Shop/>: <Navigate to={'/signin'}/>} />
    </Routes>
    </div>

    </>
  )
}

export default App
