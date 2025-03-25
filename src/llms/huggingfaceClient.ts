import * as dotenv from 'dotenv';
import * as path from 'path';
import * as vscode from 'vscode';

// 🔐 Chargement des variables d’environnement depuis le fichier `.env`
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// 🔑 Clé API Hugging Face lue depuis la variable d’environnement
const HF_API_KEY = process.env.HF_API_KEY;
const HF_TOKEN = HF_API_KEY;

// 🌐 URL du modèle StarCoder hébergé sur Hugging Face
const HF_MODEL_URL = "https://api-inference.huggingface.co/models/bigcode/starcoder";

/**
 * Interface représentant la réponse du modèle Hugging Face.
 */
interface HuggingFaceResponse {
  generated_text?: string;
  error?: string;
}

/**
 * 📤 Appelle le modèle Hugging Face (StarCoder) en utilisant la technique FIM (Fill-In-the-Middle).
 * 
 * La requête est formatée selon le protocole FIM :
 * - `<fim_prefix>` ...code avant la zone manquante...
 * - `<fim_suffix>` ...code après la zone manquante...
 * - `<fim_middle>` indique où la génération doit s’insérer.
 * 
 * @param prefix - Le code précédant la zone à compléter.
 * @param suffix - Le code suivant la zone à compléter.
 * @returns Le texte généré par le modèle pour combler la zone intermédiaire.
 */
export async function callHuggingFaceModelFIM(prefix: string, suffix: string): Promise<string> {
  try {
    // 🧠 Construction du prompt FIM
    const fullPrompt = `<fim_prefix>${prefix}<fim_suffix>${suffix}<fim_middle>`;
    console.log("[FastCoding] 🧠 Prompt FIM :", fullPrompt);

    // 📡 Appel HTTP POST vers le modèle hébergé sur Hugging Face
    const response = await fetch(HF_MODEL_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: fullPrompt,
        parameters: {
          max_new_tokens: 100, // Limite du texte généré
          temperature: 0.7     // Niveau de créativité
        }
      })
    });

    // 📥 Traitement de la réponse JSON
    const result = await response.json() as HuggingFaceResponse[];
    console.log("[FastCoding] ✅ Réponse générée :", result);

    // ❌ Gestion des erreurs de l’API Hugging Face
    if (result[0]?.error) {
      throw new Error(result[0].error);
    }

    // 🔍 Récupération du texte généré sans le prompt d’entrée
    const fullOutput = result[0]?.generated_text || "";
    const generated = fullOutput.replace(fullPrompt, "").trim();

    return generated;

  } catch (err: any) {
    // 🚨 Affichage d’un message d’erreur à l'utilisateur
    console.error("❌ Erreur HuggingFace FIM :", err.message);
    vscode.window.showErrorMessage("Erreur de génération FIM : " + err.message);
    return "// Erreur de génération.";
  }
}
