import { User } from "../modal/UserModals.js";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import {
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../mailtrap/email.js";

export const Register = async (req, res) => {
  const { email, password, name } = req.body;
  try {
    if (!email || !name || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userAlreadyExist = await User.findOne({ email });
    if (userAlreadyExist) {
      return res
        .status(400)
        .json({ success: false, message: "email already exist" });
    }

    const hashPassword = await bcryptjs.hash(password, 10);
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const user = new User({
      email,
      password: hashPassword,
      name,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    await user.save();

    // JWT
    generateTokenAndSetCookie(res, user._id);

    await sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log(error, "fail to create");
    res.status(400).json({ success: false, message: "fail to create" });
  }
};

export const verifyEmail = async (req, res) => {
  const { code } = req.body;

  try {
    // Fixed: Correct MongoDB query syntax
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid or expired verification code",
        });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    await sendWelcomeEmail(user.email, user.name);

    // Fixed: Added missing response
    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log(error, "fail to verify");
    res
      .status(500)
      .json({ success: false, message: "Server error during verification" });
  }
};

export const logIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }
    const isPasswordMatch = await bcryptjs.compare(password, user.password);
    if (!isPasswordMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid password" });
    }
    generateTokenAndSetCookie(res, user._id);
    user.lastLogin = Date.now();
    await user.save();
    res
      .status(200)
      .json({
        success: true,
        message: "Login successful",
        user: { ...user._doc, password: undefined },
      });
  } catch (error) {
    console.log(error, "fail to login");
    res
      .status(500)
      .json({ success: false, message: "Server error during login" });
  }
};

export const logOut = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logout successful" });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000;
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;
    await user.save();

    await sendPasswordResetEmail(
      user.email,
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`
    );
    // await sendVerificationEmail(user.email, resetPasswordToken);
    res
      .status(200)
      .json({
        success: true,
        message: "Password reset email sent successfully",
      });
  } catch (error) {
    console.log(error, "failed to send link");
    res
      .status(500)
      .json({ success: false, message: "Password reset email failed" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired token" });
    }

    const hashPassword = await bcryptjs.hash(password, 10);
    user.password = hashPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();
    await sendResetSuccessEmail(user.email);
    res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.log(error, "fail to reset");
    res
      .status(500)
      .json({ success: false, message: "Server error during password reset" });
  }
};

export const checkAuth = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        
        if (!user) {
            return res.status(400).json({
                success: false, 
                message: "User not found"
            });
        }
        
        res.status(200).json({
            success: true, 
            user
        });
    } catch (error) {
        console.log(error, 'Failed checkAuth');
        res.status(500).json({
            success: false, 
            message: 'Server error'
        });
    }
}