import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
    },
});

export const sendPasswordResetEmail = async (
    email,
    resetLink
) => {
    await transporter.sendMail({
        from: process.env.SMTP_EMAIL,

        to: email,

        subject: "Reset your AIXchange password",

        html: `
            <h2>Password Reset</h2>

            <p>Click the link below:</p>

            <a href="${resetLink}">
                Reset Password
            </a>

            <p>This link expires in 15 minutes.</p>
        `,
    });
};

export const sendVerificationEmail = async (
    email,
    verificationLink
) => {
    await transporter.sendMail({
        from: process.env.SMTP_EMAIL,

        to: email,

        subject: "Verify your AIXchange account",

        html: `
            <h2>Verify your email</h2>

            <p>Click the link below:</p>

            <a href="${verificationLink}">
                Verify Email
            </a>

            <p>This link expires in 24 hours.</p>
        `,
    });
};