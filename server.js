import express from 'express'
import dotenv from "dotenv"
import bodyParser from 'body-parser';


const app = express();

// The body-parser is a  middleware that is  specifically used to parse the data coming in the req from the client.It is used to parse the data coming in the req in the respective javascript format.

// bodyParser.json(): This is the json() function of the body-parser module. It is a middleware that tells Express to parse incoming JSON-formatted data in the request body and convert it into a JavaScript object. After parsing, this data is attached to the req.body object, making it easily accessible.
app.use(bodyParser.json());
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`listening at the port ${PORT}`)
})