import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendRewardClaimEmail(
  recipientEmail: string,
  contributorName: string,
  projectName: string,
) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Web3Insights <support@web3insights.app>",
      to: [recipientEmail],
      subject: `Your Reward for ${projectName} Contributions is Ready!`,
      html: `
        <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; color: #333; background-color: #f7f7f7; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://web3insights.app/logo.png" alt="Web3Insights Logo" style="width: 100px; height: auto;">
          </div>
          <h2 style="color: #3498db; text-align: center; margin-bottom: 30px;">Congratulations, ${contributorName}! 🎉</h2>
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Your outstanding contributions to <strong style="color: #2c3e50;">${projectName}</strong> have been recognized. We're thrilled to inform you that you're eligible for a special reward!</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://web3insights.app/claim-reward" style="display: inline-block; background-color: #3498db; color: white; text-decoration: none; padding: 12px 25px; border-radius: 25px; font-weight: bold; transition: background-color 0.3s ease;">Claim Your Reward Now</a>
          </div>
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Your dedication and expertise are invaluable to the Web3 ecosystem. We can't wait to see what you'll accomplish next!</p>
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">If you have any questions, our support team is always here to help.</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
          <p style="font-size: 14px; color: #777; text-align: center;">Keep innovating,<br><strong style="color: #2c3e50;">The Web3Insights Team</strong></p>
        </div>
      `,
    });

    if (error) {
      console.error("Error sending reward claim email:", error);
      return { success: false, error: error.message };
    }

    console.log("Reward claim email sent successfully:", data);
    return { success: true, data };
  } catch (err) {
    console.error("Unexpected error sending reward claim email:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}
