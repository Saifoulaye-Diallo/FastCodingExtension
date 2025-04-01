
import { getOpenAIClient } from '../../llms/openaiClient.ts';
import { getConfigurationModel } from '../../utils/settings';

/**
 * @module codeCompletion
 * 
 * @description
 * Ce module fournit une fonction d'autocomplétion basée sur un modèle d'intelligence artificielle
 * (comme GPT-4 Turbo). Il est utilisé pour prédire intelligemment la suite du code que l'utilisateur
 * est en train d'écrire dans un éditeur VSCode, en se basant sur le contexte présent avant et après
 * le curseur. La complétion est brutale (sans explication ni décorations) et respecte les
 * conventions de code propres et exécutables.
 */

/**
 * 🧠 Génère une suggestion de code à partir du contexte (avant et après le curseur).
 * 
 * Cette fonction utilise le modèle configuré par l'utilisateur (par défaut GPT-4 Turbo)
 * pour prédire du code brut, propre et prêt à être inséré automatiquement.
 * Elle est conçue pour s'intégrer dans un `InlineCompletionItemProvider` pour VSCode.
 * 
 * @async
 * @function codeCompletion
 * 
 * @param {string} before - Le code présent avant le curseur (contexte gauche).
 * @param {string} [after=''] - Le code situé après le curseur (contexte droit, facultatif).
 * 
 * @returns {Promise<string>} - La complétion générée par l'IA (code brut prêt à l'insertion).
 * 
 * @example
 * const suggestion = await codeCompletion("function hello(", ")");
 * // Résultat attendu : "name) {\n  console.log('Hello ' + name);\n}"
 */
export async function codeCompletion(before: string, after: string = ''): Promise<string> {
  const prompt = `${before}<CURSOR>${after}`;
  const model = getConfigurationModel();

  try {
    switch (model) {
      case 'GPT-4':
      default: {
        const openai = getOpenAIClient();
        const completion = await openai.chat.completions.create({
          model: "gpt-4-turbo",
          messages: [
            {
              role: "system",
              content: `Tu es une IA de complétion de code comme GitHub Copilot.
Ton rôle est de prédire ce que l’utilisateur est en train de taper, à partir du contexte fourni.

❗ Règles strictes :
- Ne retourne que du **code brut** (aucun commentaire, explication ou markdown).
- Le code doit être prêt à être inséré immédiatement après le curseur.
- Le code doit être **syntaxiquement valide** et **exécutable**.
- Chaque ligne de code doit être correctement indentée.
- Si plusieurs instructions sont générées, elles doivent être séparées par des retours à la ligne (\n).
- Le code généré ne doit pas causer d'erreurs de syntaxe.
- La complétion doit **terminer correctement** toutes les instructions (aucune parenthèse manquante, aucune ligne incomplète).
- Fais tous les contrôles nécessaires afin d’avoir un code parfait et sécurisé qui peut réussir à tous les tests.
- Ne dupliques pas le code déjà présent avant le curseur.
- Si une ligne de code est déjà commencée, complète-la intelligemment **sur la même ligne** sans revenir à la ligne inutilement.
- Chaque bloc de code (fonction, classe, boucle, condition, etc.) doit être **commencé sur une nouvelle ligne propre**.
- Ne génère jamais plusieurs blocs de code collés sur la même ligne (ex. : deux fonctions à la suite sur une même ligne).
- Le code doit être lisible, proprement structuré, et immédiatement exécutable sans modification.
- Aucune phrase, aucun texte explicatif ou décoratif.`
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 80,
          temperature: 0.7,
          top_p: 1,
          stop: ["\n\n"]
        });

        return completion.choices[0]?.message?.content?.trim() ?? '';
      }
    }
  } catch (error) {
    console.error('[FastCoding] ❌ Erreur LLM inline :', error);
    return '';
  }
}
