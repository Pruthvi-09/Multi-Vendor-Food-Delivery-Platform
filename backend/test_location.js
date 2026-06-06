const mongoose = require('mongoose');
const User = require('./models/user.model');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URL).then(async () => {
  try {
    const longitude = 74.192189;
    const latitude = 16.675935;
    
    // First, try to find any delivery boy regardless of distance to verify they exist
    const allBoys = await User.find({ role: 'deliveryBoy' });
    console.log('All delivery boys:', allBoys.map(b => b.email));

    const nearByDeliveryBoys = await User.find({
      role: 'deliveryBoy',
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [Number(longitude), Number(latitude)] },
          $maxDistance: 50000 // 50km
        }
      }
    });
    console.log('Boys found in 50km:', nearByDeliveryBoys.length, nearByDeliveryBoys.map(b => b.email));
  } catch(e) {
    console.log(e);
  }
  mongoose.disconnect();
});



