const express=require("express");
const app= express.Router();

//const app = require("../Index.route");
const service =require("../../Services/service")

app.get("/pickup",service.pickupDrone);

module.exports=app