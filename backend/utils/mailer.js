// ./mail.js
const nodemailer = require("nodemailer");

const auth = {
        user: 'duane75@ethereal.email', // sender address
        pass: 'UPSB9bCpt36C3kyWW1'
    }

const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email", // modify to actual email provider
    port: 587,
    secure: false, // upgrade later with STARTTLS
    auth: auth,
  });

// send mail with password resetting link 
module.exports.sendResetPasswordEmail = async (userEmail, resetToken, firstConnection = false) => {
  const resetLink = `http://example.com/reset-password?token=${resetToken}`; // Replace with your actual reset link
  let message

  const resetMessage = `
    <h2>Réinitialisation de votre mot de passe</h2>
            <p>Bonjour,</p>
            <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
            <p>
              Cliquez sur le lien ci-dessous pour choisir un nouveau mot de passe :
            </p>
            <p>
              <a href="${resetLink}" style="color: white; background: #007BFF; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                Réinitialiser mon mot de passe
              </a>
            </p>
            <p>Si vous n'êtes pas à l'origine de cette demande, ignorez ce mail.</p>
  `
  const firstConnectionMessage = `
  <h2>Bienvenue dans notre application !</h2>
          <p>Bonjour,</p>
          <p>Votre compte a été créé avec succès.</p>
          <p>
            Cliquez sur le lien ci-dessous pour définir votre mot de passe et accéder à votre compte :
          </p>
          <a href="${resetLink}" style="color: white; background: #007BFF; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                Définir mon mot de passe
              </a>
          <p>
  `
  if (firstConnection) { message = firstConnectionMessage} else { message = resetMessage}

  try { 
  transporter.sendMail({
        from: auth.user,
        to: userEmail,
        subject: "Hello from tests ✔",
        text: "Cliquez sur ce lien pour réinitialiser votre mot de passe : " + resetLink, // fallback texte
        html: message, 
      })
      .then((info) => {
        console.log("Message sent: %s", info.messageId);
        // Preview the stored message in Ethereal’s web UI
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      })
    }
      catch(error){
        console.error("Error sending email:", error);
      }
  
};