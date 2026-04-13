const nodemailer = require("nodemailer")

let otpStore = {}

const sendOTP = async (email) => {
    try {
        const normalizedEmail = email.toLowerCase().trim()

        const otp = Math.floor(1000 + Math.random() * 9000)

        otpStore[normalizedEmail] = otp

        console.log("Generated OTP:", otp)
         console.log("Stored OTP:", otpStore[normalizedEmail])
        const transporter = nodemailer.createTransport({
            // host: "sandbox.smtp.mailtrap.io",
            // port: 2525,   // 👈 ye use karo
            // auth: {
            //     user: "ffef6419be9dde",   // 👈 screenshot se copy
            //     pass: "ff219d6998b78e"    // 👈 screenshot se copy
            // }
            service: "gmail",
  auth: {
    user:'yourcareerbridge.app@gmail.com',        // 👈 apna gmail
    pass: "ztdz rzmj hyxe wzbr"      // 👈 16 digit app password (no spaces)
  }
        })

        const info = await transporter.sendMail({
            from: "yourcareerbridge.app@gmail.com",
            to: email,
            subject: "CareerBridge OTP",
            text: `Your OTP is ${otp}`
        })

        console.log("Mail sent:", info.response)

    } catch (err) {
        console.log("🔥 REAL ERROR:", err)
        throw err
    }
}

module.exports = { sendOTP, otpStore }