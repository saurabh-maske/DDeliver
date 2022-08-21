const express = require('express');
const app = express();

app.use('/getdrone',require("./pickup/pickdrone"))
app.use('/scheduledrone',require("./scheduletrip/starttrip"));
app.use("/command",require("./sendCommand/sendCommand"))
app.use("/unload",require("./unloadItem/unloadItem"))




module.exports = app;
