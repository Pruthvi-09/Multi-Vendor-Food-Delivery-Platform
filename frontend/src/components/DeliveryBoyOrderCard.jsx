import React from 'react';

const DeliveryBoyOrderCard = ({ data }) => {
  const shopOrder = data?.shopOrders?.[0];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!data || !data._id) {
    return null;
  }

  return (
    <div className='bg-white rounded-xl shadow-md p-4 space-y-4 border border-gray-100 hover:shadow-lg transition-smooth'>
      {/* Header */}
      <div className='flex justify-between items-start border-b pb-3'>
        <div>
          <p className='font-semibold text-base'>Order #{data._id?.slice(-6)}</p>
          <p className='text-sm text-gray-500'>{formatDate(data.createdAt)}</p>
        </div>
        <span className='bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1'>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Delivered
        </span>
      </div>

      {/* Shop and Customer Info */}
      <div className='space-y-2'>
        <div className='bg-orange-50 p-3 rounded-lg'>
          <p className='text-xs text-gray-600 mb-1'>Shop</p>
          <p className='font-semibold text-sm text-gray-800'>{shopOrder?.shop?.name}</p>
        </div>
        
        <div className='bg-gray-50 p-3 rounded-lg'>
          <p className='text-xs text-gray-600 mb-1'>Customer</p>
          <p className='font-semibold text-sm text-gray-800'>{data.user?.fullname}</p>
          <p className='text-xs text-gray-500 mt-1'>{data.deliveryAddress?.text}</p>
        </div>
      </div>

      {/* Items */}
      <div>
        <p className='text-xs text-gray-600 mb-2'>Items Delivered</p>
        <div className='flex gap-2 overflow-x-auto pb-2 scrollbar-hide'>
          {shopOrder?.shopOrderItems?.map((item, index) => (
            <div key={index} className='flex-shrink-0 w-24 border rounded-lg p-2 bg-white'>
              <img 
                src={item.items?.image} 
                alt={item.name} 
                className='w-full h-16 object-cover rounded mb-1' 
              />
              <p className='text-xs font-medium truncate'>{item.name}</p>
              <p className='text-xs text-gray-500'>Qty: {item.quantity}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className='flex justify-between items-center pt-3 border-t'>
        <div>
          <p className='text-xs text-gray-500'>Delivery Fee</p>
          <p className='text-lg font-bold text-green-600'>₹40</p>
        </div>
        <div className='text-right'>
          <p className='text-xs text-gray-500'>Order Total</p>
          <p className='text-sm font-semibold text-gray-800'>₹{shopOrder?.subtotal || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default DeliveryBoyOrderCard;
