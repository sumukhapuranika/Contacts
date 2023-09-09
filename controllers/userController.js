const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

//@desc Register user
//@route POST /api/users
//@access public
const registerUser = asyncHandler(async(req,res)=>{
    //console.log("Requested body: ",req.body);
    const {username,email,password} = req.body;
    if(!username || !email || !password){
        res.status(400);
        throw new Error("All fields are mandatory.");
    }
    const userAvailable = await User.findOne({email});
    if(userAvailable){
        throw new Error("User already registered.");
    }

    //hash password;
    const hashedPassword = await bcrypt.hash(password,10);
    const user = await User.create({
        username,
        email,
        password:hashedPassword
    });

    console.log(`User created ${user}`);
    if(user){
        res.status(200).json({_id:user.id, email:user.email})
    }else{
        res.status(400);
        throw new Error("user data not valid");
    }
});

//@desc Login user
//@route POST /api/users/login
//@access public

const loginUser = asyncHandler(async(req,res)=>{
    const {email,password} = req.body;
    if(!email || !password){
        res.status(400);
        throw new Error("All fields are mandatory");
    }
    const user = await User.findOne({email});
    // if(!user){
    //     res.status(404);
    //     throw new Error("User not found.");
    // }

    if(user && (await bcrypt.compare(password,user.password))){
        const accessToken = jwt.sign(
            {
                user:{
                    usernme:user.username,
                    email:user.email,
                    id:user.id
                },
            },
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn:"15m"}
        );
        res.status(200).json(accessToken);
    }else{
        res.status(401);
        throw new Error("Email or password is not valid");
    }
});

//@desc Current user info
//@route POST /api/users/current
//@access private

const currentUser = asyncHandler(async(req,res)=>{
    res.json(req.user);
})

module.exports = {registerUser,loginUser,currentUser};