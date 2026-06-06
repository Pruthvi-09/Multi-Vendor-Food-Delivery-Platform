import React from 'react'
import OwnerDashboard from '../components/OwnerDashboard'
import DeliveryBoy from '../components/DeliveryBoy'
import { useSelector} from 'react-redux'
import UserDashboards from '../components/UserDashboards'
import Nav from '../components/Nav'

const Home = () => {

  const {userData}= useSelector(state => state.user)
  return (
    <>
      <Nav />
      <div className='w-full min-h-[100vh] pt-[80px] sm:pt-[90px] md:pt-[100px] flex flex-col items-center bg-[#fff9f6] px-3 sm:px-4'>
           {userData.role=='user' && <UserDashboards/>}
            {userData.role=='owner' && <OwnerDashboard/>}
             {userData.role=='deliveryBoy' && <DeliveryBoy/>}
      </div>
    </>
  )
}

export default Home