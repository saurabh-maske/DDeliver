const dronesModel=require("../DataAdapter/Models/drones");
const warehouse=require("../DataAdapter/Models/warehouse")


class TripService{
async starttip(req,res){
    try{
      let droneId=req.query.droneId;//{ $addToSet: { <field1>: <value1>, ... }
      let itemId=req.query.itemId;
       console.log(droneId,itemId)

       const blockDrone= await dronesModel.findOneAndUpdate({dronId:droneId},{$set:{isAvailable:1}})
       const startTrip= await warehouse.findOneAndUpdate({itemId:itemId},{$set:{"isItemPicked":1},$push:{"itemJourney":`Material Picked - ${itemId} with drone ${droneId}`}})
 
       res.status(200).json({"message":`${startTrip.itemName} picked from location ${startTrip.pickupLocation} with drone ${droneId}`})

    }
    catch(err){
        console.log(err)
    }
}
}
module.exports=new TripService