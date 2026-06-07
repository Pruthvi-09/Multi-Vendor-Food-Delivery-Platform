const express= require('express')
const dotenv= require('dotenv')
dotenv.config()


const connectDB = require('./config/db.js')
const cookieParser = require('cookie-parser')
const cors= require('cors')
const PORT= process.env.PORT || 5000


const authRouter= require('./routes/auth.routes.js')
const userRouter = require('./routes/user.routes.js')
const shopRouter = require('./routes/shop.routes.js')
const itemRouter = require('./routes/item.routes.js')
const orderRouter = require('./routes/order.routes.js')



const http = require('http')
const { Server } = require('socket.io')
const socketHandler = require('./socket.js')
const app=express()
const server=http.createServer(app)

const io=new Server(server,{
   cors:({
    origin: ['https://quickbite-43lo.onrender.com'],
    credentials:true,
    methods:['POST','GET']
}) 
})

app.set('io',io)

app.use(cors({
    origin: ['https://quickbite-43lo.onrender.com'],
    credentials:true
}))

app.use(express.json())
app.use(cookieParser())

app.use('/api/auth',authRouter)
app.use('/api/user',userRouter)
app.use('/api/shop',shopRouter)
app.use('/api/item',itemRouter)
app.use('/api/order',orderRouter)

socketHandler(io)


server.listen(PORT,()=>{
     connectDB()
    console.log('server is on');
})
