const User = require("../models/user.model");
const OTP = require("../models/otp.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");

// -------------------- NODEMAILER SETUP --------------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


// ==================== SEND OTP ====================
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ message: "Email is required" });

    // Generate 6 digit OTP
    const otp = otpGenerator.generate(6, {
      digits: true,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    console.log("Generated OTP:", otp);

    // Delete old OTPs
    await OTP.deleteMany({ email });

    // Hash OTP
    const hashedOTP = await bcrypt.hash(otp, 10);

    // Save new OTP
    await OTP.create({
      email,
      otp: hashedOTP,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min
    });

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It expires in 5 minutes.`,
    });

    return res.status(200).json({
      message: "OTP sent successfully",
    });

  } catch (error) {
    console.error("Send OTP Error:", error);
    return res.status(500).json({
      message: "Error sending OTP",
      error: error.message,
    });
  }
};



// ==================== REGISTER ====================
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({
        message: "Email and password are required",
      });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({
        message: "User already exists",
      });

    const user = new User({
      email,
      password, // will hash automatically
      isVerified: true,
    });

    await user.save();

    return res.status(201).json({
      message: "User registered successfully."
    });

  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({
      message: "Signup failed",
      error: error.message,
    });
  }
};



// ==================== VERIFY OTP ====================
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      return res.status(400).json({
        message: "Email and OTP are required",
      });

    const record = await OTP.findOne({ email }).sort({ createdAt: -1 });

    if (!record)
      return res.status(400).json({
        message: "OTP not found",
      });

    if (record.expiresAt < new Date())
      return res.status(400).json({
        message: "OTP expired",
      });

    const isValid = await bcrypt.compare(otp, record.otp);

    if (!isValid)
      return res.status(400).json({
        message: "Invalid OTP",
      });

    // Update user verification
    await User.updateOne(
      { email },
      { isVerified: true }
    );

    // Delete OTP after success
    await OTP.deleteMany({ email });

    return res.status(200).json({
      message: "OTP verified successfully",
    });

  } catch (error) {
    console.error("Verify OTP Error:", error);
    return res.status(500).json({
      message: "OTP verification failed",
      error: error.message,
    });
  }
};



// ==================== LOGIN ====================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({
        message: "Email and password are required",
      });

    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({
        message: "User not found",
      });

    

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(400).json({
        message: "Invalid password",
      });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};
