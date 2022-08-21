require('dotenv').config()
const express = require('express')
const app = express();
const bodyParser = require('body-parser')
const enviroment = process.env.NODE_ENV || 'Local'
const morgan = require('morgan')
const mongoSanitize = require('express-mongo-sanitize')
const cors = require('cors')

const helmet = require('helmet')
// ---- Enviroment Setup based on the process env ----

let envConfig

switch (enviroment) {
  case 'UAT':
    envConfig = require('./configs/uat.config.json');
    break;
  case 'Local':
    envConfig = require('./Configs/local.config.json');
    break;

  default:
    envConfig = require('./Configs/local.config.json');
    break;
};

module.exports = envConfig;

// Configuring Cluster And Server Port
let debugMode = (process.env.DEBUG_MODE) || true;
if (debugMode) {
  app.listen(envConfig._Local_Port_, () => {
    console.log(` App Running ${envConfig.ServerName}  on port : ${envConfig._Local_Port_}`)
  });
} else {
  

    app.listen(envConfig._Local_Port_, () => {
      console.log(` App Running ${envConfig.ServerName}  on port : ${envConfig._Local_Port_}`)
    });
  
}

// MiddleWares

app.use(bodyParser.urlencoded({ extended: true, limit: '25mb' }))
app.use(bodyParser.json())
app.use(morgan('dev'))
// app.use(morgan('combined', { stream: winston.stream }));
app.use(cors())
app.use(helmet())
app.use(mongoSanitize())
// app.use(require('express-request-id')())

app.use(require('./Routes/Index.route'))

// Dependencies

require('./DataAdapter/Connection')

// Routers Config
app.use(require('./Routes/Index.route'))
