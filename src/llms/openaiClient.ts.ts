import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as vscode from 'vscode';
import { getExtensionContext } from '../utils/context';


// ✅ Chargement du fichier .env à la racine du projet
dotenv.config({ path: path.resolve(__dirname, '../.env') });

/**
 * 📌 Initialise le client OpenAI en récupérant la clé depuis le contexte global.
 * 
 * À appeler uniquement **à l'intérieur** d'une fonction ou d'une commande,
 * jamais dans le scope global (sinon erreur d'initialisation).
 */
export function getOpenAIClient(): OpenAI {
    const context = getExtensionContext();
    const apiKey = context.globalState.get<string>('fastCoding.apiKey');

    if (!apiKey) {
        vscode.window.showErrorMessage("🚨 Clé API OpenAI manquante. Configurez-la via la commande 'Fast Coding: Set API Key'.");
        throw new Error("Clé API OpenAI manquante.");
    }

    return new OpenAI({ apiKey });
}


