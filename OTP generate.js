const nodemailer = require("nodemailer")

let otpStore = {}

const sendOTP = async (email) => {
    try {
        const normalizedEmail = email.toLowerCase().trim()

        const otp = Math.floor(1000 + Math.random() * 9000)

        otpStore[normalizedEmail] = otp

        console.log("Generated OTP:", otp)
        console.log("Stored OTP:", otpStore[normalizedEmail])
        
        try {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: 'yourcareerbridge.app@gmail.com',
                    pass: "ztdz rzmj hyxe wzbr"
                }
            })

            const info = await transporter.sendMail({
                from: "yourcareerbridge.app@gmail.com",
                to: email,
                subject: "CareerBridge OTP",
                text: `Your OTP is ${otp}`
            })

            console.log("Mail sent:", info.response)
        } catch (mailErr) {
            console.log("⚠️ NODEMAILER SMTP ERROR:", mailErr.message)
            console.log("--------------------------------------------------")
            console.log(`👉 LOCAL DEVELOPER TEST OTP FOR ${email} IS: ${otp}`)
            console.log("--------------------------------------------------")
        }

    } catch (err) {
        console.log("🔥 REAL ERROR:", err)
        throw err
    }
}

module.exports = { sendOTP, otpStore }