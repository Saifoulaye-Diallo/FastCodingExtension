import * as dotenv from 'dotenv';
import * as path from 'path';
import OpenAI from 'openai';
import { getConfigurationModel } from '../utils/settings';

// 🔐 Chargement des variables d’environnement depuis le fichier `.env`
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// 🔑 Récupération de la clé API OpenAI depuis les variables d’environnement
const apiKey = process.env.OPENAI_API_KEY;

// 🚨 Vérification : la clé doit être présente pour utiliser l'API
if (!apiKey) {
   console.error("🚨 Clé API OpenAI manquante.");
   throw new Error("Clé API OpenAI manquante.");
}

/**
 * 📌 Fonction utilitaire pour instancier un client OpenAI.
 * 
 * @returns Une instance prête à être utilisée de l’API OpenAI.
 */
function getOpenAIClient(): OpenAI {
    return new OpenAI({ apiKey: apiKey }); 
}

// 🌐 Client OpenAI initialisé
const openai = getOpenAIClient();

/**
 * 🧠 Génère du code Python à partir d'un prompt partiel.
 * 
 * Cette fonction est indépendante de VSCode. Elle peut être utilisée
 * dans n’importe quel contexte Node.js (tests automatisés, scripts CLI, etc.).
 * 
 * La génération repose sur le modèle spécifié dans les paramètres de l'utilisateur,
 * avec par défaut `GPT-4-Turbo`. Le prompt est enrichi avec un message `system` pour guider la complétion.
 * 
 * @param prompt - Le début d’une définition de fonction Python (ex: `def add(a, b):`).
 * @returns Le corps complet de la fonction généré par l’IA.
 */
export async function generateCodeCore(prompt: string): Promise<string> {
  const model = getConfigurationModel();

  switch (model) {
    case 'GPT-4':
    default: {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: `Tu es un assistant IA spécialisé dans la génération de fonctions Python complètes.

          Ton objectif est de compléter des définitions de fonctions en respectant strictement le prompt fourni.

          ❗ Règles :
          - Retourne uniquement le **corps complet de la fonction** en code brut.
          - Pas de commentaires, pas de markdown, pas d’explication.
          - Le code doit être **syntaxiquement valide** et **exécutable**.
          - La complétion doit **terminer correctement** toutes les instructions (aucune parenthèse manquante, aucune ligne incomplète).
          - Tu dois générer toute la fonction complète à partir du début fourni.
          - Fais tous les contrôles nécessaires afin d’avoir un code parfait et sécurisé qui peut réussir tous les tests.
          - Inclue la signature du code depuis le début, son indentation, et le corps entier.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7, // très faible pour favoriser des réponses précises et déterministes
        stop: ['\n\n'] // optionnel, ici pour limiter la complétion à une seule fonction
      });

      // ✅ Retourne le code généré, ou une chaîne vide en cas d’échec
      return completion.choices[0]?.message?.content?.trim() ?? '';
    }
  }
}
