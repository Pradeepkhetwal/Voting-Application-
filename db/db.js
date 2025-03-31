import mongoose from "mongoose";
import dotenv from 'dotenv';


dotenv.config();

//  This is a MongoDB connection URL that specifies the location of the MongoDB server and the database you want to connect to.
// Here we are using mongodb database which we have installed locally so as we know mongodb runs on 27017 port number by default and here /hotels is the name of database that will be created if not persent in the mongodb database.
//And don't forget to run mongodb atlas application to run mongodb server . You need to click on connect inside the mongodb atlas application (sabse phele karna hai ye).
// const mongoURL = "mongodb://localhost:27017/hotels"

// We are switching to altas for better convinience .
const mongoURI = process.env.MONGO_DB_URI;


/* mongoose.connect(): This method is used to establish a connection to the MongoDB server.

mongoURL: The connection URL for the database.

Options:(ye to by default true karne hi padte hai to establish connection jyada dhyan mat do inme)

useNewUrlParser: true: Tells Mongoose to use the new MongoDB connection string parser (to avoid deprecation warnings in MongoDB drivers).

useUnifiedTopology: true:*/

// mongoose.connect() returns a promise, and if the connection is successful, it will resolve, otherwise, it will reject with an error.
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology:true
})



// Mongoose maintains a default connection object representing the MongoDB connection. with this connection object we can easily know whether we are connected or disconnect with the mongodb server.
const db = mongoose.connection;

//we can define eventlisteners for database connection as well. There are various events like connected , disconnected ,error so we can listen them using .on() method and when these events occur we can run a callback function as defined below.

db.on('connected', () => {
  console.log("Connected to MonogDb Server")
});

db.on('error', (error) => {
  console.log("Mongo Db connection error ", error)
});

db.on('disconnected',()=>{
  console.log("Mongodb disconnected ");
})


//exporting connection object so that it can be loaded in server.js file

export default db;