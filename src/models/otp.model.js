// const mongoose = require("mongoose");
// const bcrypt = require("bcrypt");
// const otpSchema = new mongoose.Schema(
//     {
//         email: String,
//         otp: String,
//         expiresAt: Date,
//     },
//     {timestamps: true},
// );
// otpSchema.pre("save", async function () {
//     if(!this.isModified("otp")) return;
// this.otp = await bcrypt.hash(this.otp, 10);
// });
// module.exports = mongoose.model("OTP", otpSchema);
const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);


module.exports = mongoose.model("OTP", otpSchema);
