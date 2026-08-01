const controller = require('../controller/userController.js')
const { sendOTP, otpStore } = require('../OTP generate.js')   
const express = require('express')
const router = express.Router()

router.post('/saveUser', controller.saveUser)
router.post('/loginUser', controller.loginUser)
router.put('/updateUser/:id', controller.updateUser)

// send OTP
router.post('/sendOTP', async (req, res) => {
  try {
    const { email } = req.body

    const { otp, sentSuccess } = await sendOTP(email)

    res.json({ 
      message: "OTP sent to email", 
      sentSuccess,
      otp: sentSuccess ? undefined : otp
    })

  } catch (err) {
    console.log(" ROUTE ERROR:", err.message)
    res.status(500).json({ message: err.message })
  }
})

// verify OTP 
router.post('/verifyOTP', (req, res) => {
  const { email, otp } = req.body

  const normalizedEmail = email.toLowerCase().trim()

  const storedOtp = otpStore[normalizedEmail]

  console.log("Stored OTP:", storedOtp)
  console.log("Entered OTP:", otp)
  console.log("Email used:", normalizedEmail)

  if (!storedOtp) {
    return res.status(400).json({ message: "OTP expired or not found" })
  }

  if (String(storedOtp) === String(otp)) {
    delete otpStore[normalizedEmail]
    return res.json({ message: "OTP verified" })
  } else {
    return res.status(400).json({ message: "Invalid OTP" })
  }
})

router.post('/forgotPassword', controller.forgotPassword)
router.post('/resetPassword', controller.resetPassword)

module.exports = router