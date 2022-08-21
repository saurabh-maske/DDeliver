const express=require("express");
const app= express.Router();

//const app = require("../Index.route");
//const service =require("../../Services/service")
const unload= require("../../Services/unloadItem")

app.put("/unloadItem",unload.unloadItem);

module.exports=app