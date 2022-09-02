const Post = require('../models/Post');
const User = require('../models/User');
const router = require('express').Router();

//test
// router.get("/", async (req, res)=>{
//     console.log("Posts page");
//     await res.status(200).json("Post");
// });

/****** Create a post ******/
router.post("/", async (req, res)=>{
    const newPost = new Post(req.body);
    try{
        const savedPost = await newPost.save();
        res.status(200).json(savedPost);
    }catch(err){
        console.log("posts.js -> create -> " + err);
        res.status(500).json(err);
    }
});

/****** Update a post ******/
router.put("/:id", async (req, res) => {//:id->post id
    try{
        const post = await Post.findById(req.params.id);
        if(post.userId === req.body.userId){// check if req user is same as post user for update
            await post.updateOne({
                $set: req.body
            });
            res.status(200).json("The post has been updated");
        }
        else{
            res.status(403).json("You can update only your post");
        }
    }
    catch(err){
        console.log("posts.js -> update post -> " + err);
        res.status(500).json(err);
    }
    
});
/****** Delete a post ******/
router.delete("/:id", async (req, res) => {//:id->post id
    try{
        const post = await Post.findById(req.params.id);
        if(post.userId === req.body.userId){// check if req user is same as post user for update
            await post.deleteOne();
            res.status(200).json("The post has been deleted");
        }
        else{
            res.status(403).json("You can delete only your post");
        }
    }
    catch(err){
        console.log("posts.js -> delete post -> " + err);
        res.status(500).json(err);
    }
    
});
/****** Like and Dislike a post ******/
router.put("/:id/like", async (req, res)=>{ 
    try{ 
        const post = await Post.findById(req.params.id);
        if(!post.likes.includes(req.body.userId)){ // check if like array includes like
            await post.updateOne({
                $push: {likes: req.body.userId} // push in like array
            });
            res.status(200).json("You have liked the post");
        }
        else{
            await post.updateOne({
                $pull: {likes: req.body.userId}
            });
            res.status(200).json("You have disliked the post");
        }
        
    }
    catch(err){
        console.log("posts.js -> like -> " + err);
        res.status(500).json(err);
    }
});

/****** Get a post ******/
router.get("/:id", async (req, res)=>{
    try{
        const post = await Post.findById(req.params.id);
        // const {_id, createdAt, ...others} = post._doc;
        res.status(200).json(post);
    }
    catch(err){
        console.log("post.js -> get a post -> " + err);
        res.status(500).json(err);
    }
});

/****** Get timeline posts ******/ // => all followings and post of users
// router.get("/timeline", async (req, res)=>{ => "/timeline" conflicts with /:id hence we need to change it
router.get("/timeline/all", async (req, res)=>{
    try{
        
        const currentUser = await User.findById(req.body.userId);
        const userPosts = await Post.find({
            userId: currentUser._id
        });
        // since we will have multiple promises instead of using await, we will use "Promise"
        // if we use only await, then it is not going to give us all users, since await works with one promise
        const friendPosts = await Promise.all(
            // for current users followings, we will get all the ids of followings 
            // and using map, for each friend we are finding there posts by id and adding it in friend post
            currentUser.followings.map((friendId) => {
                return Post.find({userId: friendId});
            })
        );
        // ...friendPosts -> all posts in friendPosts
        //hence take all the post of friends and concat with user post to give one list of post
        res.status(200).json(userPosts.concat(...friendPosts));
        
    }
    catch(err){
        console.log("post.js -> get timeline post -> " + err);
        res.status(500).json(err);
    }
});

module.exports = router;