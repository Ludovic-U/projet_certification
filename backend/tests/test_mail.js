const { sendResetPasswordEmail } = require("../utils/mailer");



function main() {
    console.log("Sending test emails...");
  sendResetPasswordEmail("test@example.com", "testfirstcotoken", true);
  sendResetPasswordEmail("test@example.com", "testresettoken", false);
  console.log("Emails sent (if no errors)");
}

main()