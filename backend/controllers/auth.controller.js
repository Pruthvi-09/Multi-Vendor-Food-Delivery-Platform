const User=require('../models/user.model.js')
const Bcrypt=require('bcryptjs')
const gentoken= require('../utils/token.js')
const sendOtpMail = require('../utils/mail.js')


// ---------------------sign up---------------------

 const signUp= async (req,res)=>{
    try{

        const{fullname, email,password,mobile,role}=req.body
        let user= await User.findOne({email})
        if(user){
           return res.status(400).json({
                error:true,
                message:'user already available'
            })
        }

        if(password.length<6){
            return res.status(400).json({
                message:'password must be at least 6 characters'
            })
        }

        if(mobile.length<10 || mobile.length>10){
             return   res.status(400).json({
            message:"mobile number must be  in 10 digit"
           })
        }

        const hashedPassword= await Bcrypt.hash(password,10)

        user=await User.create({
            fullname,
            email,
            mobile,
            role,
            password:hashedPassword
        })

        const token = await gentoken(user._id)

        res.cookie('token',token,{
            secure:true, // for security purpose
            sameSite:'none', 
            maxAge:7*24*60*60*1000, // defines how many days token is valid 7 days
            httpOnly:true
        })
        
        res.status(201).json({
            data:user,
            message:'user is created'
        })
    }catch(err){

        console.log(err)

    return res.status(500).json({
        error:true,
        message:`sign up error ${err.message}`
    })
    }
}

// ---------------------sign in---------------------

 const signIn= async (req,res)=>{
    try{

        const{ email,password}=req.body
        const user= await User.findOne({email})
        if(!user){
          return  res.status(400).json({
                error:true,
                message:'user doesnot exist'
            })
        }

        // Check if user has a password (not a Google auth user)
        if(!user.password){
          return res.status(400).json({
                error:true,
                message:'This account was created with Google. Please sign in with Google.'
            })
        }

       const isMatch=await Bcrypt.compare(password,user.password)
       if(!isMatch){
        return res.status(400).json({
            error:true,
            message:'password is not match'
        })
       }


        const token = await gentoken(user._id)

        res.cookie('token',token,{
             secure:true, // for security purpose
            sameSite:'none', 
            maxAge:7*24*60*60*1000, // defines how many days token is valid 7 days
            httpOnly:true
        })
        
        res.status(200).json({
            data:user,
            message:'user is logged in'
        })
    }catch(error){

        return res.status(500).json({
            error:true,
            message:`sign In error${error}`
        })
    }
}


// -------------------------sign out-------------------------
 const signOut= async(req,res)=>{
try {
    res.clearCookie('token')
    return res.status(200).json({
        message:'log out successfully'
    })
    
} catch (error) {
     return res.status(500).json({
            error:true,
            message:`sign out error${error}`
        })
}

}

//------------------------ otp send --------------------------
const sendOtp=async(req,res)=>{
    try {
         const{ email}=req.body
        const user= await User.findOne({email})
        if(!user){
          return  res.status(400).json({
                error:true,
                message:'user does not exist'
            })
        }

        // otp create
        const otp=Math.floor(1000 + Math.random() * 9000).toString()

        user.resetOtp=otp // stores in resetOtp
        user.otpExpires=Date.now()+5*60*1000
        user.isOtpVerified=false
        await user.save()

        sendOtpMail(email,otp)

        return res.status(200).json({
            error:false,
        message:'otp sent successfully'
    })
    } catch (error) {
         return res.status(500).json({
            error:true,
            message:`otp send error${error}`
        })
    }
}

//-------------------------------verify otp-------------------------------
const verifyOtp= async(req,res)=>{

    try {
         const{ email,otp}=req.body
        const user= await User.findOne({email})
        if(!user || user.resetOtp!=otp || user.otpExpires<Date.now()){
          return  res.status(400).json({
                error:true,
                message:'invalid/expired otp'
            })
        }

        user.isOtpVerified=true
        user.resetOtp=undefined
        user.otpExpires=undefined
         await user.save()

         return res.status(200).json({
            error:false,
        message:'otp verified successfully'
    })

    } catch (error) {
        return res.status(500).json({
            error:true,
            message:`otp verification error${error}`
        })
    }
}

//---------------------------reset password---------------------------

const resetPassword=async(req,res)=>{
   try {
      const{ email,newPassword}=req.body
        const user= await User.findOne({email})
        if(!user || !user.isOtpVerified){
          return  res.status(400).json({
                error:true,
                message:'user verification required'
            })
        }

         const newHashedPassword= await Bcrypt.hash(newPassword,10)

         user.password=newHashedPassword // new password is stored.
         user.isOtpVerified=false
         await user.save()

        return res.status(200).json({
        message:'password reset successfully successfully'
    })
    
   } catch (error) {
    
     return res.status(500).json({
            error:true,
            message:`password reset error${error}`
        })
   }
}

//---------------------- google authentication--------------------------

const googleAuth= async(req,res)=>{
    try {
        
        const{fullname, email,mobile,role}=req.body
         //find user
         let user= await User.findOne({email})
         if(!user){
             user=await User.create({
                fullname,
                email,
                mobile,
                role
             })
         }
 const token = await gentoken(user._id)

        res.cookie('token',token,{
            secure:true, // for security purpose
            sameSite:'none', 
            maxAge:7*24*60*60*1000, // defines how many days token is valid 7 days
            httpOnly:true
        })

        return res.status(200).json({
            data:user,
            message:'google authentication successful'
        })

    } catch (error) {
            return res.status(500).json({
            error:true,
            message:`google auth error${error}`
        })
        
    }

}
module.exports={
     signUp,
    signIn,
    signOut,
    sendOtp,verifyOtp,resetPassword, googleAuth
}
