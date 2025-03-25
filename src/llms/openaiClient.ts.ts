import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as vscode from 'vscode';

// ✅ Chargement du fichier .env à la racine du projet
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// 🔐 Récupération de la clé API OpenAI depuis les variables d’environnement
const apiKey = process.env.OPENAI_API_KEY;

// 🚨 Affiche une erreur si la clé API est absente
if (!apiKey) {
    vscode.window.showErrorMessage("🚨 Clé API OpenAI manquante.");
    throw new Error("Clé API OpenAI manquante.");
}

/**
 * 📌 3️⃣ Fonction utilitaire qui crée et retourne un client OpenAI.
 * 
 * Utilise la clé API chargée depuis `.env` pour instancier le client.
 * Cela permet de centraliser la configuration OpenAI pour tous les modules
 * de l’extension (chat, complétion, génération de documentation, etc.).
 * 
 * @returns Instance du client OpenAI prête à être utilisée.
 */
function getOpenAIClient(): OpenAI {
    return new OpenAI({ apiKey: apiKey });
}

/**
 * ✨ Client OpenAI exporté pour toute l’extension.
 * 
 * Peut être importé dans d’autres fichiers pour faire des appels à l’API
 * (ex: `openai.chat.completions.create(...)`)
 */
export const openai = getOpenAIClient();
