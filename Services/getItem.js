const warehouse=require("../DataAdapter/Models/warehouse")


class getItemService{
async getItem(req,res){
    try{
     

       const availableItems= await warehouse.find({isItemPicked:0})
       const deliveredItems= await warehouse.find({isItemPicked:1,isDelivered:1})

       if(availableItems.length==0){
        res.status(200).json({message:"NO items available at moment to deliver, contact warehouse","deliveredItems":deliveredItems})
       }else{
     
       res.status(200).json({"availableItems":availableItems,"deliveredItems":deliveredItems})
       }

    }
    catch(err){
        console.log(err)
    }
}
}
module.exports=new getItemService
