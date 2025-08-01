const express = require("express");
const axios = require("axios");
const fs = require("fs");
const { exec } = require("child_process");
const app = express();
const PORT = process.env.PORT || 3000;

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const VERIFY_TOKEN = "Mon_Token"; // même token que tu mets dans Meta

app.use(express.json());

// Route GET pour la validation du webhook par Meta
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("Webhook vérifié !");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

// Route POST pour recevoir les messages WhatsApp
app.post("/webhook", async (req, res) => {
  const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

  if (message && message.type === "image") {
    const from = message.from;
    const mediaId = message.image.id;

    try {
      // 1. Récupère l'URL de téléchargement de l'image
      const mediaResponse = await axios.get(
        `https://graph.facebook.com/v18.0/${mediaId}`,
        {
          headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
        }
      );

      const mediaUrl = mediaResponse.data.url;

      // 2. Télécharge l'image et la sauvegarde localement
      const imagePath = "./temp/image.jpg";
      const imageDownload = await axios.get(mediaUrl, {
        headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
        responseType: "stream",
      });

      const writer = fs.createWriteStream(imagePath);
      imageDownload.data.pipe(writer);

      writer.on("finish", () => {
        // 3. Appelle le script OCR
        exec(`python ocr.py ${imagePath}`, (error, stdout, stderr) => {
          if (error || stderr) {
            console.error("Erreur OCR :", error || stderr);
            return;
          }

          const texteOCR = stdout;

          // 4. Envoie le résultat OCR via WhatsApp
          axios
            .post(
              `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
              {
                messaging_product: "whatsapp",
                to: from,
                text: { body: texteOCR },
              },
              {
                headers: {
                  Authorization: `Bearer ${ACCESS_TOKEN}`,
                  "Content-Type": "application/json",
                },
              }
            )
            .then(() => console.log("✅ Message OCR envoyé à l'utilisateur"))
            .catch((err) => console.error("Erreur envoi WhatsApp :", err));
        });
      });
    } catch (e) {
      console.error("❌ Erreur générale :", e.message);
    }

    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});

