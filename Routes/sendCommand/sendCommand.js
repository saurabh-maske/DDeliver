const express=require("express");
const app= express.Router();

//const app = require("../Index.route");
//const service =require("../../Services/service")
const command= require("../../Services/sendCommand")

app.put("/sendCommand",command.sendCommands);

module.exports=app