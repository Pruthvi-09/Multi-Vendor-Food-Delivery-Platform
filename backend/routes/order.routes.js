const express = require('express')
const { placeOrder, getMyOrders, updateOrderStatus, getDeliveryBoyAssignment, acceptOrder, getCurrentOrder, getOrderById, sendDeliveryOtp, verifyDeliveryOtp, verifyPayment, getTodayDeliveries } = require('../controllers/order.controller')
const isAuth = require('../middleware/isAuth.middleware')

const orderRouter = express.Router()

orderRouter.post('/place-order', isAuth, placeOrder)
orderRouter.post('/verify-payment', isAuth, verifyPayment)

orderRouter.get('/my-orders', isAuth, getMyOrders)
orderRouter.get('/get-assignments', isAuth, getDeliveryBoyAssignment)
orderRouter.get('/get-current-order', isAuth, getCurrentOrder)
orderRouter.post('/send-delivery-otp', isAuth, sendDeliveryOtp)
orderRouter.post('/verify-delivery-otp', isAuth, verifyDeliveryOtp)
orderRouter.post('/verify-delivery-otp', isAuth, verifyDeliveryOtp)
orderRouter.get('/get-today-deliveries', isAuth, getTodayDeliveries)



orderRouter.post('/update-status/:orderId/:shopId', isAuth, updateOrderStatus)
orderRouter.get('/accept-order/:assignmentId', isAuth, acceptOrder)
orderRouter.get('/get-order-by-id/:orderId', isAuth, getOrderById)



module.exports = orderRouter

