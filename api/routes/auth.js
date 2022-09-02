const router = require("express").Router(); //create the router
const User = require("../models/User");
const bcrypt = require("bcrypt");

/*
router.get("/", (req, res) => {
    res.send("From Auth Route")
}); 
*/
//post and get are methods to access content from http
/*
   "async and await make promises easier to write"
    async makes a function return a Promise
    await makes a function wait for a Promise
*/
//Register
router.post("/register", async (req, res)=>{
    //Testing
    /*
    const user = await new User({//generates new UserSchema which we exported
        username: "Vinay",
        email: "vinaysarda2812@gmail.com",
        password: "123456"
    });
    await user.save();
    res.send("Ok");
    */
    try{
        //encrypt password
        const salt = await bcrypt.genSalt(10); //number of rounds
        const hashedPassword = await bcrypt.hash(req.body.password, salt)
        
        //create new user
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        });

        //save user and respond
        const user = await newUser.save();
        res.status(200).json(user); // 200 -> everything is ok // -> register successful

    } catch(err){
        console.log("auth.js -> register -> " + err);
        res.status(500).send(err);
    }
});

//Login
router.post("/login", async (req, res)=>{
    try{
        const user = await User.findOne({
            email: req.body.email
        });

        !user && res.status(404).json("user not found");

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        // });

        !validPassword && res.status(400).json("Invalid Password");
        res.status(200).json(user); // login successful

    }catch(err){
        console.log("auth.js -> login -> "+ err);
        res.status(500).send(err);
    }
});

module.exports = router;