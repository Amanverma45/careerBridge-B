const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../model/userModel.js')
const { validateText, validatePhone, validateUrl } = require('../helper/validationHelper.js')

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

        if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Access denied. You can only update your own profile." })
        }

        // Validate phone and location for both roles
        if (phone) {
            const phError = validatePhone(phone);
            if (phError) return res.status(400).json({ message: phError });
        }
        if (location) {
            const locError = validateText(location, "Location");
            if (locError) return res.status(400).json({ message: locError });
        }

        if (userObj.role === 'recruiter') {
            if (companyName) {
                const cnError = validateText(companyName, "Company Name");
                if (cnError) return res.status(400).json({ message: cnError });
            }
            if (companyWebsite) {
                const cwError = validateUrl(companyWebsite, "Company Website");
                if (cwError) return res.status(400).json({ message: cwError });
            }
            if (companyDescription) {
                const cdError = validateText(companyDescription, "Company Description");
                if (cdError) return res.status(400).json({ message: cdError });
            }
        } else {
            if (skills) {
                const skError = validateText(skills, "Skills");
                if (skError) return res.status(400).json({ message: skError });
            }
            if (experience) {
                const exError = validateText(experience, "Experience");
                if (exError) return res.status(400).json({ message: exError });
            }
            if (bio) {
                const bioError = validateText(bio, "Bio");
                if (bioError) return res.status(400).json({ message: bioError });
            }
            if (educationGrad) {
                const edgError = validateText(educationGrad, "Graduation details");
                if (edgError) return res.status(400).json({ message: edgError });
            }
            if (education12) {
                const ed12Error = validateText(education12, "12th details");
                if (ed12Error) return res.status(400).json({ message: ed12Error });
            }
            if (education10) {
                const ed10Error = validateText(education10, "10th details");
                if (ed10Error) return res.status(400).json({ message: ed10Error });
            }
            if (experienceCompany) {
                const ecError = validateText(experienceCompany, "Experience Company");
                if (ecError) return res.status(400).json({ message: ecError });
            }
            if (experienceRole) {
                const erError = validateText(experienceRole, "Experience Role");
                if (erError) return res.status(400).json({ message: erError });
            }
            if (linkedin) {
                const lnError = validateUrl(linkedin, "LinkedIn URL");
                if (lnError) return res.status(400).json({ message: lnError });
            }
            if (github) {
                const ghError = validateUrl(github, "GitHub URL");
                if (ghError) return res.status(400).json({ message: ghError });
            }
            if (portfolio) {
                const ptError = validateUrl(portfolio, "Portfolio URL");
                if (ptError) return res.status(400).json({ message: ptError });
            }
            if (certification) {
                const crError = validateText(certification, "Certification");
                if (crError) return res.status(400).json({ message: crError });
            }
        }

        const updateData = { 
            name,
            phone,
            location
        }
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
            unsetData.educationGrad = ""
            unsetData.education12 = ""
            unsetData.education10 = ""
            unsetData.experienceCompany = ""
            unsetData.experienceRole = ""
            unsetData.linkedin = ""
            unsetData.github = ""
            unsetData.portfolio = ""
            unsetData.certification = ""
        } else {
            updateData.skills = skills
            updateData.experience = experience
            updateData.bio = bio
            if (isPremium !== undefined) {
                updateData.isPremium = isPremium
            }

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

        if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Access denied. You cannot modify saved jobs for another user." });
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

        if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Access denied. You can only view your own saved jobs." });
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

        if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Access denied. You can only modify your own profile photo." });
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

        if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Access denied. You can only modify your own profile photo." });
        }

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

const googleLogin = async (req, res) => {
    try {
        const { token, role } = req.body;
        if (!token) {
            return res.status(400).json({ message: "Google token is required" });
        }

        const verifyResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
        if (!verifyResponse.ok) {
            return res.status(400).json({ message: "Invalid or expired Google token" });
        }

        const payload = await verifyResponse.json();
        const { email, name, picture } = payload;

        if (!email) {
            return res.status(400).json({ message: "Could not retrieve email from Google token" });
        }

        const normalizedEmail = email.toLowerCase().trim();
        let user = await User.findOne({ email: normalizedEmail });

        const adminEmail = (process.env.ADMIN_EMAIL || 'av478136@gmail.com').toLowerCase().trim();

        if (!user) {
            // Auto-assign admin if email matches adminEmail
            let assignedRole = role || 'user';
            if (normalizedEmail === adminEmail) {
                assignedRole = 'admin';
            }

            // Create a randomized secure password placeholder
            const generatedPass = Math.random().toString(36).slice(-8) + Math.random().toString(36).toUpperCase().slice(-8);
            const hashedPassword = await bcrypt.hash(generatedPass, 10);

            user = new User({
                name: name || "Google User",
                email: normalizedEmail,
                password: hashedPassword,
                role: assignedRole,
                profilePhoto: picture || undefined
            });
            await user.save();
        } else {
            // Promotes existing user to admin if their email is adminEmail
            if (normalizedEmail === adminEmail && user.role !== 'admin') {
                user.role = 'admin';
                await user.save();
            }
        }

        const ourToken = jwt.sign(
            { userId: user._id, email: user.email },
            "OUR_SECRETE_KEY",
            { expiresIn: "24h" }
        );

        return res.status(200).json({
            message: "Google login successful",
            token: ourToken,
            user
        });

    } catch (error) {
        console.error("GOOGLE LOGIN ERROR:", error.message);
        return res.status(500).json({ message: error.message });
    }
}

module.exports = { saveUser, loginUser, googleLogin, updateUser, forgotPassword, resetPassword, toggleSaveJob, getSavedJobs, uploadProfilePhoto, removeProfilePhoto }
