import bcrypt from 'bcryptjs';
import { db } from '../libs/db.js';
import { UserRole } from '../generated/prisma/index.js';
import jwt from 'jsonwebtoken';

export const register = async(req, res) =>{

    const {name, email, password} = req.body;

    try {
        const exisitngUser = await db.user.findUnique({
            where: {
                email
            }
        })
        if(exisitngUser) {
            return res.status(400).json({
                message: "User already exists"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await db.user.create({
            data:{
                email,
                name,
                password: hashedPassword,
                role: UserRole.USER
            }
        })

        const token = jwt.sign({id: newUser.id}, process.env.JWT_SECRET,{
            expiresIn: "7d"
        })

        res.cookie("jwt",token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        })

        res.status(201).json({
            message: "User created successfully",
            sucess: true,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                image: newUser.image
            }
        })


    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error creating user",
            error: error.message
        })
    }
}

export const login = async(req, res) =>{

    const {email, password} = req.body;
    
    try {
        const user = await db.user.findUnique({
            where: {
                email
            }
        })

        if(!user) {
            return res.status(401).json({
                message: "User not found"
            })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch) {
            return res.status(401).json({
                message: "Invalid credentials"
            })
        }

        const token = jwt.sign({id:user.id}, process.env.JWT_SECRET, {
            expiresIn: "7d"
        })
        res.cookie("jwt",token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        })

        res.status(200).json({
            message: "User logged in successfully",
            sucess: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                image: user.image
            }
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error logging in user",
            error: error.message
        })
    }

}

export const logout = async(req, res) =>{

    try {
        res.clearCookie("jwt", {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development",
            sameSite: "strict",
            maxAge: 0
        })

        res.status(200).json({
            sucess: true,
            message: "User logged out successfully"
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error logging out user",
            error: error.message
        })
    }
}

export const check = async(req, res) =>{

    try {
        res.status(200).json({
            sucess: true,
            message: "User authenticated successfully",
            user:req.user
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error checking user",
            error: error.message
        })
    }
}