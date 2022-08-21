const mongoose = require('mongoose');

let warehouse = mongoose.Schema({

itemName:{
    type:String
},
itemId:{
    type:String
},
pickupLocation:{
    type:String,
    
},
dropLocation:{
    type:String,


},
isDelivered:{
    type:Number,
    default:0,
},
itemJourney: [{
    type: String,
}],
isItemPicked:{
    type:Number,
    default:0
}
  }, {
    timestamps: true
});


let warehouseModel = mongoose.model('warehouse', warehouse, 'warehouse');
module.exports = warehouseModel;
