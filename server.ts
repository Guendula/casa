import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { Resend } from "resend";
import dotenv from "dotenv";
import admin from "firebase-admin";
import fs from "fs";

dotenv.config();

// Initialize Firebase Admin
const configPath = path.join(process.cwd(), "firebase-applet-config.json");
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

const db = admin.firestore();
const resend = new Resend(process.env.RESEND_API_KEY);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Send Verification Email
  app.post("/api/verify-email/send", async (req, res) => {
    const { email, uid } = req.body;

    if (!email || !uid) {
      return res.status(400).json({ error: "Email and UID are required" });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    try {
      // Store code in Firestore
      await db.collection("verification_codes").doc(uid).set({
        uid,
        email,
        code,
        expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const { data, error } = await resend.emails.send({
        from: "Imobiliária MZ <onboarding@resend.dev>",
        to: [email],
        subject: "Verifique o seu email - Imobiliária MZ",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #ea580c; text-align: center;">Verificação de Email</h2>
            <p>Olá,</p>
            <p>Obrigado por se registar na <strong>Imobiliária MZ</strong>. Para completar a verificação da sua conta, utilize o código abaixo:</p>
            <div style="background: #fff7ed; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #9a3412;">${code}</span>
            </div>
            <p>Este código expira em 10 minutos.</p>
            <p>Se não solicitou esta verificação, por favor ignore este email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #666; text-align: center;">© 2026 Imobiliária MZ. Todos os direitos reservados.</p>
          </div>
        `,
      });

      if (error) {
        console.error("Resend error:", error);
        return res.status(500).json({ error: error.message });
      }

      res.json({ success: true, data });
    } catch (err) {
      console.error("Server error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // API Route: Confirm Verification Email
  app.post("/api/verify-email/confirm", async (req, res) => {
    const { uid, code } = req.body;

    if (!uid || !code) {
      return res.status(400).json({ error: "UID and code are required" });
    }

    try {
      const docRef = db.collection("verification_codes").doc(uid);
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(404).json({ error: "Verification code not found" });
      }

      const data = doc.data();
      if (data?.code !== code) {
        return res.status(400).json({ error: "Invalid verification code" });
      }

      if (data?.expiresAt.toDate() < new Date()) {
        return res.status(400).json({ error: "Verification code expired" });
      }

      // Update user status
      await db.collection("users").doc(uid).update({
        isEmailVerified: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Delete the code
      await docRef.delete();

      res.json({ success: true });
    } catch (err) {
      console.error("Server error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
