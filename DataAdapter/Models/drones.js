const mongoose = require('mongoose');


let drones = mongoose.Schema({

droneName:{
    type:String
},
droneId:{
    type:String
},
isAvailable:{
    type:Number,
   
},


  }, {
    timestamps: true
});


let dronesModel = mongoose.model('drones', drones, 'drones');
module.exports = dronesModel;
