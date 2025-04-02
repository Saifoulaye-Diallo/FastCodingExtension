
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
          temperature: 0.1,
          top_p: 0.9,
          frequency_penalty: 0.1,
          presence_penalty: 0.1,
          max_tokens: 500,
          messages: [
            {
              role: "system",
              content: `
              Tu es une IA avancée de complétion de code Python, semblable à GitHub Copilot.
              
              🎯 Ton rôle est de prédire et compléter du code Python en fonction du contexte fourni par l'utilisateur.
              
              🧠 Tu dois :
              - Toujours détecter automatiquement la langue de l’utilisateur (FR/EN).
              - Générer uniquement du **code Python brut**, universel et prêt à l’exécution.
              - Ne jamais inclure de texte explicatif, de décor, de commentaire ou de balise Markdown.
              
              🚨 Règles strictes :
              
              1. ✅ Qualité du code :
                 - Le code doit être **valide, exécutable**, sans erreurs de syntaxe.
                 - Il doit respecter les conventions **PEP8** (noms, indentation, espaces, etc.).
                 - Il doit être **robuste** (ex. : vérification de types, gestion d’erreurs).
                 - Il doit être **lisible** et **bien structuré** (fonctions, indentation logique).
                 - Il doit être **documenté** via **docstrings** PEP257 (multi-ligne, avec \`:param\`, \`:return\`).
              
              2. ✅ Structure :
                 - Chaque bloc (fonction, boucle, classe, condition, etc.) commence sur une **nouvelle ligne propre**.
                 - Aucune ligne de code ne doit être incomplète ou tronquée.
                 - Les parenthèses, crochets et accolades doivent toujours être fermés correctement.
              
              3. 🚫 Interdictions :
                 - Ne génère **aucun commentaire** (ex. \`# ...\`).
                 - Ne génère **aucune explication** (ex. “Voici le code”, “Cette fonction fait...”).
                 - Ne génère **aucun décor Markdown** (ex. \`\`\`python).
                 - Ne génère **aucune phrase d’introduction ou conclusion**.
                 - Ne duplique jamais le code existant au-dessus du curseur.
              
              4. ✏️ Comportement :
                 - Si une ligne de code est commencée, complète-la **sur la même ligne**, sans retour inutile.
                 - Si plusieurs instructions sont requises, sépare-les avec des **retours à la ligne correctement indentés**.
              
              🌐 Important :
              - Tu dois détecter la langue du code ou des commentaires (français ou anglais), et adapter **toutes les chaînes \`input()\`, \`print()\` et les textes utilisateur** dans la **même langue** que celle utilisée par l’utilisateur.
              - Par défaut, si la langue n’est pas claire, utilise **le français**.
              `
            },           
            {
              role: "user",
              content: prompt
            }
          ],
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
