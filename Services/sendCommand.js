const warehouse=require("../DataAdapter/Models/warehouse");


class sendCommand{
async sendCommands(req,res){
    try{
      const updateJourney= await warehouse.findOneAndUpdate({isItemPicked:1},{$push:{"itemJourney":`Agent I have reached the the delivery location`}})
   res.status(200).json({message:"Message Sent Sucessfully"})
    }
    catch(err){
        console.log(err)
    }
}
}
module.exports=new sendCommand