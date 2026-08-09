const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../model/userModel.js')

const saveUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body
        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: "All fields required" })
        }

        const normalizedEmail = email.toLowerCase().trim()
        const existingUser = await User.findOne({ email: normalizedEmail })
        if (existingUser) {
            return res.status(400).json({ message: "Email is already registered" })
        }

        // Secure admin role assignment
        const adminEmail = (process.env.ADMIN_EMAIL || 'av478136@gmail.com').toLowerCase().trim()
        let assignedRole = role
        if (assignedRole === 'admin') {
            if (normalizedEmail === adminEmail) {
                assignedRole = 'admin'
            } else {
                assignedRole = 'user'
            }
        } else if (normalizedEmail === adminEmail) {
            assignedRole = 'admin'
        }

        const hashpassword = await bcrypt.hash(password, 10)
        const newUser = new User({
            name,
            email: normalizedEmail,
            password: hashpassword,
            role: assignedRole
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
        const normalizedEmail = email.toLowerCase().trim()
        const user = await User.findOne({ email: normalizedEmail })
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        const comparepassword = await bcrypt.compare(password, user.password)
        if (!comparepassword) {
            return res.status(401).json({ message: "Incorrect password" })
        }

        // Auto-promote developer email to admin if logged in
        const adminEmail = (process.env.ADMIN_EMAIL || 'av478136@gmail.com').toLowerCase().trim()
        if (normalizedEmail === adminEmail && user.role !== 'admin') {
            user.role = 'admin'
            await user.save()
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
        const { 
            name, skills, experience, bio, companyName, companyWebsite, companyDescription, isPremium,
            phone, location, educationGrad, education12, education10, experienceCompany, experienceRole,
            linkedin, github, portfolio, certification
        } = req.body
        const userId = req.params.id

        const userObj = await User.findById(userId)
        if (!userObj) {
            return res.status(404).json({ message: "User not found" })
        }

        const updateData = { name }
        const unsetData = {}

        if (userObj.role === 'recruiter') {
            updateData.companyName = companyName
            updateData.companyWebsite = companyWebsite
            updateData.companyDescription = companyDescription
            
            unsetData.skills = ""
            unsetData.experience = ""
            unsetData.bio = ""
            unsetData.resume = ""
            unsetData.resumePublicId = ""
            unsetData.phone = ""
            unsetData.location = ""
            unsetData.educationGrad = ""
            unsetData.education12 = ""
            unsetData.education10 = ""
            unsetData.experienceCompany = ""
            unsetData.experienceRole = ""
            unsetData.linkedin = ""
            unsetData.github = ""
            unsetData.portfolio = ""
            unsetData.certification = ""
            unsetData.profilePhoto = ""
            unsetData.profilePhotoPublicId = ""
        } else {
            updateData.skills = skills
            updateData.experience = experience
            updateData.bio = bio
            if (isPremium !== undefined) {
                updateData.isPremium = isPremium
            }

            updateData.phone = phone
            updateData.location = location
            updateData.educationGrad = educationGrad
            updateData.education12 = education12
            updateData.education10 = education10
            updateData.experienceCompany = experienceCompany
            updateData.experienceRole = experienceRole
            updateData.linkedin = linkedin
            updateData.github = github
            updateData.portfolio = portfolio
            updateData.certification = certification

            unsetData.companyName = ""
            unsetData.companyWebsite = ""
            unsetData.companyDescription = ""
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: updateData,
                $unset: unsetData
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

const toggleSaveJob = async (req, res) => {
    try {
        const { userId, jobId } = req.body;
        if (!userId || !jobId) {
            return res.status(400).json({ message: "userId and jobId are required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.savedJobs) {
            user.savedJobs = [];
        }

        const index = user.savedJobs.indexOf(jobId);
        let isSaved = false;

        if (index > -1) {
            user.savedJobs.splice(index, 1);
            isSaved = false;
        } else {
            user.savedJobs.push(jobId);
            isSaved = true;
        }

        await user.save();
        res.status(200).json({
            message: isSaved ? "Job saved successfully" : "Job removed from saved list",
            savedJobs: user.savedJobs,
            isSaved
        });

    } catch (error) {
        console.log("TOGGLE SAVE JOB ERROR:", error);
        res.status(500).json({ message: error.message });
    }
}

const getSavedJobs = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).populate('savedJobs');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user.savedJobs || []);
    } catch (error) {
        console.log("GET SAVED JOBS ERROR:", error);
        res.status(500).json({ message: error.message });
    }
}

const uploadProfilePhoto = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });
        if (!userId) return res.status(400).json({ message: "User ID missing" });

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.profilePhotoPublicId) {
            const cloudinary = require("../config/cloudinary");
            try {
                await cloudinary.uploader.destroy(user.profilePhotoPublicId);
            } catch (err) {
                console.error("Cloudinary error during photo replace:", err);
            }
        }

        user.profilePhoto = req.file.path;
        user.profilePhotoPublicId = req.file.filename;
        await user.save();

        res.status(200).json({
            message: "Profile photo uploaded successfully",
            user
        });
    } catch (error) {
        console.error("Upload photo error:", error);
        res.status(500).json({ message: error.message });
    }
}

const removeProfilePhoto = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ message: "User ID missing" });

        const userObj = await User.findById(userId);
        if (!userObj) return res.status(404).json({ message: "User not found" });

        if (userObj.profilePhotoPublicId) {
            const cloudinary = require("../config/cloudinary");
            try {
                await cloudinary.uploader.destroy(userObj.profilePhotoPublicId);
            } catch (err) {
                console.error("Cloudinary error during photo removal:", err);
            }
        }

        userObj.profilePhoto = undefined;
        userObj.profilePhotoPublicId = undefined;
        await userObj.save();

        res.status(200).json({
            message: "Profile photo removed successfully",
            user: userObj
        });
    } catch (error) {
        console.error("Remove photo error:", error);
        res.status(500).json({ message: error.message });
    }
}

module.exports = { saveUser, loginUser, updateUser, forgotPassword, resetPassword, toggleSaveJob, getSavedJobs, uploadProfilePhoto, removeProfilePhoto }
