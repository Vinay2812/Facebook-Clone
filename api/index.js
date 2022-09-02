// including required modules using require -> express, mongoose, dotenv, helmet, morgan
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");

dotenv.config(); // to use .env

mongoose.connect(process.env.MONGO_URL, ()=>{
    console.log("Database connected");
});

//middleware function
app.use(express.json());// body parser that parses the incoming request to json
app.use(helmet());
app.use(morgan("common"));

/*
app.get("/", (req, res)=>{ // get request and respond from "/"-> localhost:port_num/home page
    res.send("Welcome to home page");
});

app.get("/users", (req, res) => { // "/users"->localhost:port_num/users
    res.send("Welcome to users page");
});
*/

//instead of above steps we make use of RestApi
app.use("/api/users", userRoute);// whenever we go to address "/api/user" -> userRoute(imported from routes) will be used
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);
app.listen(8800, ()=>{//8800 -> port number
    console.log("Backend Server Running");
});