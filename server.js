const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "mon_token_OCRLingo";

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token && mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook vérifié !");
    res.status(200).send(challenge);
  } else {
    console.log("❌ Vérification échouée.");
    res.sendStatus(403);
  }
});

app.post("/webhook", (req, res) => {
  const body = req.body;

  console.log("📨 Requête reçue :", JSON.stringify(body, null, 2));

  if (body.object === "whatsapp_business_account") {
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];

    if (message) {
      const from = message.from;
      const type = message.type;
      console.log(`📥 Nouveau message de ${from}, type: ${type}`);

      if (type === "image") {
        const mediaId = message.image.id;
        console.log("🖼 ID de l’image reçue :", mediaId);

        // Appeler ton OCR Python ici (via API ou fonction)
      }

      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  } else {
    res.sendStatus(404);
  }
});

app.get("/", (req, res) => {
  res.send("Hello from webhook server");
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur Webhook démarré sur lesss port ${PORT}`);
});
