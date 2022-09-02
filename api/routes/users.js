const User = require("../models/User");
const router = require("express").Router(); //create the router
const bcrypt = require("bcrypt");
const { response } = require("express");

// router.get("/", (req, res)=>{
//     res.send("From User Route")
// });

/******* update user ********/ 
router.put("/:id", async(req, res)=>{// allows us to put any user id
    // check if id is correct or admin wants to update
    if(req.body.userId === req.params.id || req.body.isAdmin){
        if(req.body.password){ // if trying to update password
            try{
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);
            }
            catch(err){
                console.log("users.js -> updating user password -> "+ err);
                return res.status(500).json(err);
            } 
        }
        try{
            const user = await User.findByIdAndUpdate(req.params.id, {
                $set: req.body,
            });
            res.status(200).json("Account has been updated");
        }
        catch(err){
            console.log("users.js -> updated user data -> "+ err);
            return res.status(500).json(err);
        }
    }
    else{
        return res.status(403).json("You can update only your account");
    }
});
/******** delete user *******/
router.delete("/:id", async(req, res)=>{// allows us to put any user id
    if(req.body.userId === req.params.id || req.body.isAdmin){
        try{
            await User.findByIdAndDelete(req.params.id);
            res.status(200).json("Account has been Deleted");
        }
        catch(err){
            console.log("users.js -> deleted user -> "+ err);
            return res.status(500).json(err);
        }
    }
    else{
        return res.status(403).json("You can delete only your account");
    }
});
/******* get an user *******/
router.get("/:id", async(req, res)=>{
    try{
        const user = await User.findById(req.params.id);
        // storing password, updated info separately and all other documents in other object
        const {password, updatedAt, ...other} = user._doc;// contains all object
        res.status(200).json(other);
    }
    catch(err){
        console.log("users.js -> get user -> " + err);
        res.status(500).json(err);
    }
});
/********* follow an user ********/
router.put("/:id/follow", async(req, res)=>{
    if(req.body.userId !== req.params.id){//Not same user
        try{
            const user = await User.findById(req.params.id);//other to whom i want to follow
            const currentUser = await User.findById(req.body.userId);//me

            if(!user.followers.includes(req.body.userId)){//if i am not in user followers list

                // add my id in his followers
                await user.updateOne({ $push: {followers: req.body.userId } });

                //add his id in my followings
                await currentUser.updateOne({ $push: {followings: req.params.id } });
                res.status(200).json("User has been followed");
            }
            else{
                return res.status(403).json("You already follow this user")
            }
        }
        catch(err){
            console.log("users.js -> follow user -> " + err);
            res.status(500).json(err);
        }
    }
    else{
        res.status(403).json("You can't follow yourself");
    }
});
/***** un-follow an user ******/
router.put("/:id/unfollow", async(req, res)=>{
    if(req.body.userId !== req.params.id){//Not same user
        try{
            const user = await User.findById(req.params.id);//other to whom i want to follow
            const currentUser = await User.findById(req.body.userId);//me

            if(user.followers.includes(req.body.userId)){//if i am not in user followers list

                // add my id in his followers
                await user.updateOne({ $pull: {followers: req.body.userId } });

                //add his id in my followings
                await currentUser.updateOne({ $pull: {followings: req.params.id } });
                res.status(200).json("User has been un-followed");
            }
            else{
                return res.status(403).json("You don't follow the user");
            }
        }
        catch(err){
            console.log("users.js -> un-follow user -> " + err);
            res.status(500).json(err);
        }
    }
    else{
        res.status(403).json("You can't un-follow yourself");
    }
});

module.exports = router;