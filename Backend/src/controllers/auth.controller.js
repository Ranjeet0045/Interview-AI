const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/blacklist.model");

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
};


/**
 * @name registerUserController
 * @description register a new user, excpects username, email and password in the request body
 * @access Public
 */

async function registerUserController(req, res){

    const {username, email, password} = req.body
    
    if(!username || !email || !password){
        return res.status(400).json({
            message: "Please provide username, email and password"
        })
    }
    const isUserAlreadyExists = await userModel.findOne({
        $or: [{username}, {email}]
    })
    if(isUserAlreadyExists){
        return res.status(400).json({
            message: "Account already exist with this email or username"
        })
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await userModel.create({
        username,
        email,
        password: hash
    })

    const token = jwt.sign(
        {id: user._id, username: user.username},
        process.env.JWT_SECRET,
        {expiresIn: "1d"}
    )

    res.cookie("token", token, cookieOptions)
    res.status(201).json({
        message: "User registered successfully",
        token,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}

/**
 * @name loginUserController
 * @description login a user, expects email and password in the request body
 * @access public
 */

async function loginUserController(req, res){
    const {email, password} = req.body;
    const user = await userModel.findOne({email})

    if(!user){
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid){
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    const token = jwt.sign({
        id: user._id, username: user.username
    },
        process.env.JWT_SECRET,
        {expiresIn: "1d"}
    )
    res.cookie("token", token, cookieOptions)
    res.status(200).json({
        message: "User loggedIn successfully.",
        token,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}

/**
 * @name logoutUserController
 * @description clear token from user cookie and add the token in blacklist
 * @access public
 */

async function logoutUserController(req, res){
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if(token){
        await tokenBlacklistModel.create({token})
    }
    res.clearCookie("token", cookieOptions)
    res.status(200).json({
        message: "User logged out succssfully"
    })
}

/**
 * @name getMeController
 * @description get the current logged in details
 * @access private
 */
async function getMeController(req, res){
    const user = await userModel.findById(req.user.id);

    res.status(200).json({
        message: "User details fetched successfully",
        user:{
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}

/**
 * @name updateProfileController
 * @description update the current logged in user's profile (username and/or email)
 * @access private
 */
async function updateProfileController(req, res){
    try {
        const {username, email} = req.body;

        if(!username && !email){
            return res.status(400).json({
                message: "Please provide at least one field to update"
            })
        }

        const updateFields = {};
        if(username) updateFields.username = username;
        if(email) updateFields.email = email;

        const isUserAlreadyExists = await userModel.findOne({
            $or: [
                ...(username ? [{username}] : []),
                ...(email ? [{email}] : [])
            ],
            _id: { $ne: req.user.id }
        })

        if(isUserAlreadyExists){
            return res.status(400).json({
                message: "Username or email already taken by another user"
            })
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            req.user.id,
            updateFields,
            { new: true }
        );

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email
            }
        })
    } catch(error){
        res.status(500).json({
            message: "Something went wrong",
            error: error.message
        })
    }
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController,
    updateProfileController
}