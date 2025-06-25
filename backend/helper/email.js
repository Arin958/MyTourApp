const { PASSWORD_RESET_REQUEST_TEMPLATE } = require("./emailTemplate");
const { mailtrapClient, sender } = require("./mailtrap");

const sendPasswordResetEmail = async (email, resetToken) => {
  const recipient = [{ email }];
  try {
    const response = await mailtrapClient.send({
        from:sender,
        to: recipient,
        subject: "Password Reset",
        html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetToken}", resetToken),
        category: "Password Reset",
    })

    console.log("Email sent successfully:", response);
  } catch (error) {
    
     console.error("❌ Error sending email:", error.message);
    throw new Error("Failed to send email. Check Mailtrap token and sender.");
  }
};

module.exports = { sendPasswordResetEmail };
