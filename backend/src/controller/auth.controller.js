import bcrypt from "bcryptjs";
import { db } from "../libs/db.js";
import { UserRole } from "../generated/prisma/index.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";

import dotenv from "dotenv";
dotenv.config();

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide all the required fields",
    });
  }

  try {
    const exisitngUser = await db.user.findUnique({
      where: {
        email,
      },
    });
    if (exisitngUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(32).toString("hex");
    console.log(verificationToken);

    const newUser = await db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: UserRole.USER,
        verificationToken,
        verificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
      },
    });

    // send token over mail

    const transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      secure: false,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASSWORD,
      },
    });
    console.log(process.env.BASE_URL);
    const mailOptions = {
      from: process.env.MAILTRAP_SENDER_EMAIL,
      to: newUser.email,
      subject: "Verify your email",
      text: `Please click on the below url to verify:
            ${process.env.BASE_URL}/api/v1/auth/verify/${verificationToken}/${newUser.id}
            `,
      html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Verify Your Email</h2>
            <p>Please click the button below to verify your email address:</p>
            <a href="${process.env.BASE_URL}/api/v1/auth/verify/${verificationToken}/${newUser.id}" 
               style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; 
                      text-decoration: none; border-radius: 5px; margin-top: 10px;">
              Verify Email
            </a>
            <p>If you didn’t request this, you can safely ignore this email.</p>
          </div>
        `,
    };

    await transporter.sendMail(mailOptions);

    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      message: "User created successfully",
      sucess: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        image: newUser.image,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error creating user",
      error: error.message,
    });
  }
};

export const verifyUser = async (req, res) => {
  const { token, userId } = req.params;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Please provide a token",
    });
  }

  const user = await db.user.findUnique({
    where: {
      id: userId,
      verificationToken: token,
    },
  });
  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Invalid token",
    });
  }
  if (user.verificationTokenExpiry < new Date()) {
    return res.status(400).json({
      success: false,
      message: "Token expired",
    });
  }
  await db.user.update({
    where: {
      id: user.id,
    },
    data: {
      verificationToken: null,
      verificationTokenExpiry: null,
      isVerified: true,
    },
  });
  res.status(200).json({
    success: true,
    message: "User verified successfully",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
    },
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await db.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: "User logged in successfully",
      sucess: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error logging in user",
      error: error.message,
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      maxAge: 0,
    });

    res.status(200).json({
      sucess: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error logging out user",
      error: error.message,
    });
  }
};

export const check = async (req, res) => {
  try {
    res.status(200).json({
      sucess: true,
      message: "User authenticated successfully",
      user: req.user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error checking user",
      error: error.message,
    });
  }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await db.user.findMany({});
    
        res.status(200).json({
        success: true,
        message: "Users fetched successfully",
        users,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
        message: "Error fetching users",
        error: error.message,
        });
    }
}

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({
        success: false,
        message: "Please provide an email",
        });
    }
    
    try {
        const user = await db.user.findUnique({
        where: {
            email,
        },
        });
    
        if (!user) {
        return res.status(400).json({
            success: false,
            message: "User not found",
        });
        }
    
        const resetToken = crypto.randomBytes(32).toString("hex");
    
        await db.user.update({
        where: {
            id: user.id,
        },
        data: {
            resetPasswordToken:resetToken,
            resetPasswordTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
        },
        });
    
        const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_HOST,
        port: process.env.MAILTRAP_PORT,
        secure: false,
        auth: {
            user: process.env.MAILTRAP_USER,
            pass: process.env.MAILTRAP_PASSWORD,
        },
        });
    
        const mailOptions = {
        from: process.env.MAILTRAP_SENDER_EMAIL,
        to: user.email,
        subject: "Reset your password",
        text: `Please click on the below url to reset your password:
                ${process.env.BASE_URL}/api/v1/auth/resetpassword/${resetToken}/${user.id}
                `,
                html:`
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Reset Your Password</h2>
                    <p>Please click the button below to reset your password:</p>
                    <a href="${process.env.BASE_URL}/api/v1/auth/resetpassword/${resetToken}/${user.id}" 
                    style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; 
                    text-decoration: none; border-radius: 5px; margin-top: 10px;">
                    Reset Password
                    </a>
                    <p>If you didn’t request this, you can safely ignore this email.</p>
                </div>
                `
    
        };
    
        await transporter.sendMail(mailOptions);
    
        res.status(200).json({
            success: true,
            message: "Reset password link sent to email",
            user:{
                id:user.id,
                name:user.name,
                email:user.email,
                role:user.role,
                image:user.image
            }
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error sending reset password link",
            error: error.message,
        });
    }

}

export const resetPassword = async (req, res) => {
    const { token, userId } = req.params;
    const { password } = req.body;
    
    if (!token || !password || !userId) {
        return res.status(400).json({
        success: false,
        message: "Please provide all the required fields",
        });
    }
    
    try {
        const user = await db.user.findUnique({
        where: {
            id: userId,
            resetPasswordToken: token,
        },
        });
    
        if (!user) {
        return res.status(400).json({
            success: false,
            message: "Invalid token",
        });
        }
    
        if (user.resetPasswordTokenExpiry < new Date()) {
        return res.status(400).json({
            success: false,
            message: "Token expired",
        });
        }
    
        const hashedPassword = await bcrypt.hash(password, 10);
    
        await db.user.update({
        where: {
            id: user.id,
        },
        data: {
            password: hashedPassword,
            resetPasswordToken: null,
            resetPasswordTokenExpiry: null,
        },
        });
    
        res.status(200).json({
            success: true,
            message: "Password reset successfully",
            user:{
                id:user.id,
                name:user.name,
                email:user.email,
                role:user.role,
                image:user.image
            }
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error resetting password",
            error: error.message,
        });
    }
}
