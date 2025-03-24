import OpenAI from 'openai';
import * as vscode from 'vscode';
import * as dotenv from 'dotenv';
import * as path from 'path';

// ✅ Chargement du fichier .env à la racine
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
    vscode.window.showErrorMessage("🚨 Clé API OpenAI manquante.");
    throw new Error("Clé API OpenAI manquante.");
}
// 📌 3️⃣ Fonction qui retourne le client OpenAI
function getOpenAIClient(): OpenAI {
    return new OpenAI({ apiKey: apiKey }); 
}
export const openai = getOpenAIClient();

