const dronesModel=require("../DataAdapter/Models/drones");
const warehouse=require("../DataAdapter/Models/warehouse")


class UnloadService{
async unloadItem(req,res){
    try{
    
       const updateJourney= await warehouse.findOneAndUpdate({isItemPicked:1},{$set:{"isDelivered":1},$push:{"itemJourney":`Items Unloaded returning back to warehouse`}});
       const reachedStatus= await warehouse.findOneAndUpdate({isItemPicked:1,isDelivered:1},{$push:{"itemJourney":`Ready for Next Delivery`}})
       const droneStatus= await dronesModel.findOneAndUpdate({isAvailable:1},{$set:{isAvailable:0}})
       res.status(200).json({message:"Sucessfully Unloaded Items"})
      

    }
    catch(err){
        console.log(err)
    }
}
}
module.exports=new UnloadService
