const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../model/userModel.js')

const saveUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body
        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: "All fields required" })
        }

        const hashpassword = await bcrypt.hash(password, 10)
        const newUser = new User({
            name,
            email: email.toLowerCase(),
            password: hashpassword,
            role
        })
        await newUser.save()
        res.status(201).json({ message: "User saved successfully" })
    } catch (error) {
        console.log("REAL ERROR:", error)
        res.status(500).json({ message: error.message })
    }
}

const loginUser = async (req, res) => {
    const { email, password } = req.body

    try {
        const user = await User.findOne({ email: email.toLowerCase() })
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        const comparepassword = await bcrypt.compare(password, user.password)
        if (!comparepassword) {
            return res.status(401).json({ message: "Incorrect password" })
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email },
            "OUR_SECRETE_KEY",
            { expiresIn: "24h" }
        )

        res.status(200).json({
            message: "User login successfully",
            token,
            user
        })

    } catch (error) {
        console.log("LOGIN ERROR:", error)
        res.status(500).json({ message: error.message })
    }
}

const updateUser = async (req, res) => {
    try {
        const { name, skills, experience, bio } = req.body
        const userId = req.params.id

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {

                name,
                skills,
                experience,
                bio,
            },
            { new: true }
        )

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" })
        }

        return res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser
        })

    } catch (error) {
        console.log("UPDATE ERROR:", error.message)
        return res.status(500).json({ message: error.message })
    }
}


const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body
        if (!email) {
            return res.status(400).json({ message: "Email is required" })
        }

        const user = await User.findOne({ email: email.toLowerCase() })
        if (!user) {
            return res.status(404).json({ message: "User not found with this email" })
        }

        const { sendOTP } = require('../OTP generate.js')
        const { otp, sentSuccess } = await sendOTP(email)

        res.status(200).json({ 
            message: "Password reset OTP sent to email", 
            sentSuccess,
            otp: sentSuccess ? undefined : otp
        })

    } catch (error) {
        console.log("FORGOT PASSWORD ERROR:", error)
        res.status(500).json({ message: error.message })
    }
}

const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: "All fields are required" })
        }

        const { otpStore } = require('../OTP generate.js')
        const normalizedEmail = email.toLowerCase().trim()
        const storedOtp = otpStore[normalizedEmail]

        if (!storedOtp || String(storedOtp) !== String(otp)) {
            return res.status(400).json({ message: "Invalid or expired OTP" })
        }

        const user = await User.findOne({ email: normalizedEmail })
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        const hashpassword = await bcrypt.hash(newPassword, 10)
        user.password = hashpassword
        await user.save()

        delete otpStore[normalizedEmail]

        res.status(200).json({ message: "Password reset successful" })

    } catch (error) {
        console.log("RESET PASSWORD ERROR:", error)
        res.status(500).json({ message: error.message })
    }
}

module.exports = { saveUser, loginUser, updateUser, forgotPassword, resetPassword }
