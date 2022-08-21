const express=require("express");
const app= express.Router();

//const app = require("../Index.route");
//const service =require("../../Services/service")
const trip= require("../../Services/starttrip")
const availableItems=require("../../Services/getItem")

app.get("/starttrip",trip.starttip);
app.get("/item",availableItems.getItem)


module.exports=app