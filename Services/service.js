const dronesModel=require("../DataAdapter/Models/drones");


class pickupService{
async pickupDrone(req,res){
    try{
       const availableDrones= await dronesModel.find({isAvailable:0})
       console.log("availableDrones",availableDrones)
       res.json(availableDrones)
    }
    catch(err){
        console.log(err)
    }
}
}
module.exports=new pickupService