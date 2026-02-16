const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


async function registerUser(req, res) {
    const {fullName: {firstName, lastName}, email, password } = req.body;

    const isUserAlreadyExists = await userModel.findOne({ email });

    if (isUserAlreadyExists) {
        return res.status(400).json({ message: "User already exists." })
    }

    const hashPassword = await bcrypt.hash(password, 10);


    const user = await userModel.create({
        fullName: {
            firstName, lastName
        },
        email,
        password: hashPassword
    })

    const token = jwt.sign({id:user._id}, process.env.JWT_SECRET, {expiresIn: "1d"})

    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "Lax",
        secure: false,
    })

    res.status(201).json({
        message: "User registered successfully",
        user:{
            email: user.email,
            _id: user._id,
            fullName: user.fullName
        }
    });
    

}


async function loginUser(req, res) {
    
    try {
        const {email, password} = req.body;

    const user = await userModel.findOne({
        email
    })

    if(!user) {
        return res.status(400).json({ message: "Invalid email or Password"})
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid) {
        return res.status(400).json({ message: "Invalid email or password"})
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {expiresIn: '1d'});

    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "none",
        secure: true
    });

    res.status(200).json({
        message: "User logged in successfully",
        user: {
            email: user.email,
            _id: user._id,
            fullName: user.fullName
        }
    })
    } catch (err) {
        res.status(500).json({ message: "Login failed"})
    }
}


async function getMe(req, res) {
    res.status(200).json({
        user: {
            _id: req.user._id,
            email: req.user.email,
            fullName: req.user.fullName
        }
    })
}

async function logoutUser(req, res) {
    res.clearCookie("token");

    res.status(200).json({
        message: "Logged out successfully"
    })
}


module.exports = {registerUser, loginUser, getMe, logoutUser};