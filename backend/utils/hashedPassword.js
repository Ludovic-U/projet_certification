const bcrypt = require("bcrypt");
const { hashPassword } = require("./hash");

(async () => {
  try {
    const mdp = "test"; // Le mot de passe à hash
    const hashedMdp = await hashPassword(mdp);
    console.log("Mdp:", mdp);
    console.log("Mdp hashé:", hashedMdp);
  } catch (err) {
    console.error("Erreur lors du hash :", err);
  }
})();
