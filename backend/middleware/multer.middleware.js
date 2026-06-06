const multer= require('multer')
const storage= multer.diskStorage({
    destination:(req, file, cb)=>{
        // cb= callback mostly used for defining destination
        cb(null,'./public')
    },
    filename:(req, file, cb)=>{
        cb(null, file.originalname)
    }
})

const upload= multer({storage})

module.exports = upload