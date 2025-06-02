// Import des modules nécessaires
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour parser le JSON reçu dans les requêtes POST
app.use(express.json());

// ====== Vérification Webhook (GET) ======
app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = "mon_token_OCRLingo";

  // Extraire les paramètres de requête
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  // Vérification du token
  if (mode && token && mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook vérifié !");
    res.status(200).send(challenge); // Renvoie le challenge à Meta
  } else {
    console.log("❌ Vérification échouée.");
    res.sendStatus(403);
  }
});

// ====== Réception des messages (POST) ======
app.post("/webhook", (req, res) => {
  const body = req.body;

  console.log("📨 Requête reçue :", JSON.stringify(body, null, 2));

  // Vérifie que l'objet concerne WhatsApp
  if (body.object === "whatsapp_business_account") {
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];

    if (message) {
      const from = message.from;
      const type = message.type;
      console.log(`📥 Nouveau message de ${from}, type: ${type}`);

      // Exemple : traiter une image reçue
      if (type === "image") {
        const mediaId = message.image.id;
        console.log("🖼 ID de l’image reçue :", mediaId);

        // → Ici tu pourras appeler ton OCR Python avec l'image
      }

      // Répond rapidement à Meta
      res.sendStatus(200);
    } else {
      res.sendStatus(404); // Aucun message trouvé
    }
  } else {
    res.sendStatus(404); // Mauvais type d'objet
  }
});



// Route test simple pour vérifier que le serveur fonctionne
app.get("/", (req, res) => {
  res.send("Hello from webhook server");
});

// ====== Lancement du serveur ======
app.listen(PORT, () => {
  console.log(`🚀 Serveur Webhook démarré sur http://localhost:${PORT}`);
});
