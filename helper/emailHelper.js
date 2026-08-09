const nodemailer = require("nodemailer");

const sendStatusEmail = async (candidateEmail, candidateName, companyName, jobTitle, status) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: 'yourcareerbridge.app@gmail.com',
                pass: "dbjo hhus xsdo rouq"
            }
        });

const frontendUrl = process.env.FRONTEND_URL;
        console.log("--- SENDING EMAIL --- FRONTEND URL USED:", frontendUrl);
        const isShortlisted = status === "shortlisted";
        const subject = isShortlisted 
            ? `Application Update: You are Shortlisted for ${jobTitle} at ${companyName}`
            : `Application Update: Status for ${jobTitle} at ${companyName}`;

        const greeting = `Hi ${candidateName || "Candidate"},`;
        
        const content = isShortlisted
            ? `We have exciting news! Your profile has been <strong>shortlisted</strong> for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>. The hiring team will connect with you soon for the next steps.`
            : `Thank you for your interest in the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>. After careful review of your application, we regret to inform you that we will not be moving forward with your profile at this time. We wish you all the best in your search.`;

        const badgeColor = isShortlisted ? "#0d9488" : "#e11d48";
        const badgeText = isShortlisted ? "SHORTLISTED" : "REJECTED";

        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Application Status Update</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #f8fafc; color: #1e293b; padding: 20px; margin: 0; }
                .container { max-width: 580px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 30px; margin: 0 auto; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
                .logo { font-size: 20px; font-weight: 800; color: #2563eb; text-decoration: none; margin-bottom: 24px; display: inline-block; }
                .title { font-size: 22px; font-weight: 900; color: #0f172a; margin-top: 0; margin-bottom: 16px; }
                .status-badge { display: inline-block; padding: 6px 12px; font-size: 11px; font-weight: 800; border-radius: 6px; color: #ffffff; background-color: ${badgeColor}; letter-spacing: 0.5px; margin-bottom: 24px; }
                .message { font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 30px; }
                .btn { display: inline-block; padding: 12px 24px; font-size: 14px; font-weight: 700; color: #ffffff !important; background-color: #2563eb; border-radius: 12px; text-decoration: none; text-align: center; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); }
                .footer { font-size: 12px; color: #64748b; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">Career<span style="color: #14b8a6">Bridge</span></div>
                <h1 class="title">Application Update</h1>
                <div class="status-badge">${badgeText}</div>
                <p class="message" style="font-size: 16px; font-weight: bold; margin-bottom: 8px;">${greeting}</p>
                <p class="message">${content}</p>
                <div style="text-align: center; margin-top: 10px;">
                    <a href="${frontendUrl}/profile" class="btn" style="color: #ffffff !important;">Open / View Application</a>
                </div>
                <div class="footer">
                    This is an automated notification from CareerBridge. Please do not reply to this email.
                </div>
            </div>
        </body>
        </html>
        `;

        const info = await transporter.sendMail({
            from: "yourcareerbridge.app@gmail.com",
            to: normalizedEmailCheck(candidateEmail),
            subject: subject,
            html: html
        });

        console.log(`Status notification mail sent to ${candidateEmail}:`, info.response);
        return { success: true };
    } catch (mailErr) {
        console.error("⚠️ Nodemailer status email send failure:", mailErr.message);
        return { success: false, error: mailErr.message };
    }
}

const normalizedEmailCheck = (email) => {
    if (!email) return "";
    return email.toLowerCase().trim();
}

module.exports = { sendStatusEmail };
