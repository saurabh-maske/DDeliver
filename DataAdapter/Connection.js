const mongoose = require('mongoose')
const envConfig = require('../Server')
mongoose.Promise = global.Promise


//-----Database Connection----------
try {
  
 
 

  if (process.env.NODE_ENV === 'Local') {
    Conn=`${envConfig.Database.uri}`
  };

  if (process.env.NODE_ENV === 'UAT') {
    Conn=`${envConfig.Database.uri}`
  };
 

  

    mongoose.connect( Conn,
    
    { 

      useUnifiedTopology: true,
      useNewUrlParser: true,
   //   useCreateIndex:true,
   //   useFindAndModify: false

    }, (err, conn)=>{  
      
      if(err) return console.error( err);
      console.log( `Sucessfully Connected to Database `); 
      mongoose.set('debug', true);
    });

  } catch (error) {
       console.error( error);
  };
//---------------------------------------

module.exports = mongoose;
