const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Configuration for sending emails
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const generateOTP = async (otpsCollection, req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).send({ success: false, message: 'Email is required' });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    try {

        await otpsCollection.updateOne(
            { email },
            { $set: { otp, expiresAt } },
            { upsert: true }
        );


        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'RecycMate - Your Verification OTP',
            text: `Your OTP for secure registration is: ${otp}. It will expire in 5 minutes.`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Email error:", error);
                return res.status(500).send({ success: false, message: 'Failed to send OTP email' });
            }
            res.send({ success: true, message: 'OTP sent to your email' });
        });

    } catch (error) {
        console.error("OTP generation error:", error);
        res.status(500).send({ success: false, message: 'Internal server error' });
    }
};

const verifyOTP = async (otpsCollection, req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        return res.status(400).send({ success: false, message: 'Email and OTP are required' });
    }

    try {
        const storedOTP = await otpsCollection.findOne({ email });

        if (!storedOTP) {
            return res.status(404).send({ success: false, message: 'No OTP found for this email' });
        }

        if (storedOTP.otp !== otp) {
            return res.status(400).send({ success: false, message: 'Invalid OTP' });
        }

        if (new Date() > storedOTP.expiresAt) {
            return res.status(400).send({ success: false, message: 'OTP has expired' });
        }


        await otpsCollection.deleteOne({ email });
        res.send({ success: true, message: 'OTP verified successfully' });

    } catch (error) {
        console.error("OTP verification error:", error);
        res.status(500).send({ success: false, message: 'Internal server error' });
    }
};

module.exports = {
    generateOTP,
    verifyOTP
};
