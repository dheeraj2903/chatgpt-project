import userModel from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const registerUser = async (req, res) => {
  try {
    const {
      fullName: { firstName, lastName },
      email,
      password,
    } = req.body;
  
    const isUserAlreadyExist = await userModel.findOne({email})
  
    if(isUserAlreadyExist) {
      return res.status(400).json({
          message: "User Already exists"
      })
    }
  
    const hashPassword = await bcrypt.hash(password, 10)
  
    const user = await userModel.create({
      fullName:{
          firstName, lastName
      },
      email,
      password: hashPassword
    }) 
  
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d"});
  
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 *1000
    });
  
    res.status(201).json({
      message: "User registered successfully",
      user: {
          email: user.email,
          _id: user._id,
          fullName: user.fullName,
      }
    })
  } catch (err) {
    console.error("Register Error:", err);
    return res.status(500).json({ message: "Internal Server Error"})
  }

};

const loginUser = async (req, res) => {

  try {
    const { email, password } = req.body;
  
    const user = await userModel.findOne({
      email
    })
  
    if(!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      })
    }
  
    const isPasswordValid = await bcrypt.compare(password, user.password);
  
    if(!isPasswordValid){
      return res.status(400).json({
        message: "Invalid email or password"
      })
    }
    const token = jwt.sign({ id: user._id}, process.env.JWT_SECRET, { expiresIn: "1d"});
  
    res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        maxAge: 24 * 60 * 60 *1000
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
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

const getMe = async (req, res) => {
  res.status(200).json({
    user: {
      _id: req.user._id,
      email: req.user.email,
      fullName: req.user.fullName
    }
  })
}

const logoutUser = async (req, res) => {
    res.clearCookie("token");

    res.status(200).json({
      message: 'Logged our successfully'
    })
} 

export { registerUser, loginUser, logoutUser, getMe }