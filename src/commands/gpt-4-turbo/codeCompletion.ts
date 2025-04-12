
import { getOpenAIClient } from '../../evaluation/openaiClientEval';
import { getConfigurationModel } from '../../utils/settings';

/**
 * Remplace les tirets d’indentation par des espaces (4 espaces par niveau).
 * Exemple :
 * ----return x →     return x
 */
function removeDashesIndentation(code: string): string {
  return code
    .split('\n')
    .map(line => line.replace(/^(-{4})+/, match => ' '.repeat(match.length)))
    .join('\n');
}

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
              Tu es une IA spécialisée en complétion de code Python.

              🎯 Objectif :
              Compléter uniquement le bloc de code Python fourni (souvent une fonction partiellement écrite), en respectant les règles suivantes.

              ✅ Règles :
              1. Retourne uniquement le **code à compléter**, pas le code déjà présent.
              2. Chaque ligne **indentée** doit utiliser des tirets (\`-\`) à la place des espaces :
                - Une indentation de 4 espaces = \`----\`
                - 8 espaces = \`--------\`, etc.
              3. Ne retourne **aucun docstring**, aucun commentaire, aucune ligne vide inutile.
              4. Le code doit être :
                - Syntaxiquement **valide**
                - Conforme à **PEP8**
                - Directement **exécutable**
              5. Tu ne réécris **jamais** la signature de la fonction.
              6. Aucune phrase explicative, aucune balise Markdown, **uniquement du code brut avec indentation en tirets**.

              📦 Exemple de réponse attendue :
              Si l'utilisateur donne :
                  def somme(a, b):
                      """Additionne deux entiers."""
              Et qu'il manque le \`return\`, tu dois répondre :
              ----return a + b

              C’est tout.`
              
            },       
            {
              role: "user",
              content: prompt
            }
          ],
        });

        const rawCompletion = completion.choices[0]?.message?.content?.trim() ?? '';
        const cleanCompletion = removeDashesIndentation(rawCompletion);
        return cleanCompletion;
      }
    }
  } catch (error) {
    console.error('[FastCoding] ❌ Erreur LLM inline :', error);
    return '';
  }
}
