import * as vscode from 'vscode';
import { getOpenAIClient } from '../../llms/openaiClient.ts';

/**
 * 📚 Génère automatiquement une documentation en français
 * pour le code sélectionné dans l’éditeur actif.
 *
 * Fonctionnalités :
 * - Si le code est une fonction ou une classe ➜ insère un **docstring** (Python, JS, TS...).
 * - Si c’est un bloc de code isolé ➜ insère un **commentaire explicatif au-dessus**.
 *
 * La documentation générée est formatée proprement, sans markdown, et insérée automatiquement dans le fichier.
 */
export async function generateDocumentation() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  // 📄 Récupère le code sélectionné dans l’éditeur
  const selectedCode = editor.document.getText(editor.selection).trim();

  // 🚨 Avertit si aucune sélection n’est faite
  if (!selectedCode) {
    vscode.window.showWarningMessage("⚠ Veuillez sélectionner une fonction, une classe ou un bloc de code.");
    return;
  }

  // 🤖 Vérifie si le code sélectionné est probablement une fonction ou classe
  const isFunctionOrClass = /^(\s*)(def |class |async |public |function )/.test(selectedCode);

  try {
    // 📤 Requête au modèle GPT-4 Turbo pour générer la documentation
    const openai = getOpenAIClient();
    const res = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `# Générateur Strict de Documentation Technique

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠ DIRECTIVES ABSOLUES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. NE JAMAIS :
   - Écrire "Je ne peux pas..."
   - Demander des précisions
   - Générer du code original
   - Faire des phrases d'introduction
   - Pas de # et // ensemble

2. TOUJOURS :
   - Détecter automatiquement le langage
   - Générer UNIQUEMENT la documentation
   - Suivre strictement les formats ci-dessous

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 FORMATS OBLIGATOIRES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pour JavaScript/TypeScript :
/**
 * Description en 1 phrase
 * @param {type} param Description
 * @returns {type} Description
 */

Pour blocs JS/TS :
// Description en 3-7 mots

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 EXEMPLE D'EXÉCUTION CORRECTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Entrée :
let result = addTwoNumbers(5, 3);
console.log("Résultat:", result);

Sortie REQUISE :
// Affiche le résultat 5+3

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 REJET AUTOMATIQUE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Toute réponse contenant :
- "Je ne peux pas"
- "Pourriez-vous"
- Du code original
- Des phrases d'introduction
- # et // ensemble 
`
        },
        {
          role: "user",
          content: selectedCode
        }
      ],
      temperature: 0.4,
      max_tokens: 200
    });

    const doc = res.choices[0].message?.content?.trim();

    // ⚠ Avertit si l'IA n’a rien généré
    if (!doc) {
      vscode.window.showWarningMessage("⚠ Aucune documentation générée.");
      return;
    }

    // 🧮 Calcul de l’indentation courante de la ligne sélectionnée
    const selection = editor.selection;
    const startLine = selection.start.line;
    const lineText = editor.document.lineAt(startLine).text;
    const indentMatch = lineText.match(/^\s*/);
    const indentation = indentMatch ? indentMatch[0] + '    ' : '    ';

    // 🖊️ Insertion de la documentation générée
    editor.edit(editBuilder => {
      if (isFunctionOrClass) {
        // 🔹 Cas : fonction ou classe ➜ insère un docstring indenté à l'intérieur
        const formattedDocstring = doc
          .split('\n')
          .map(line => indentation + line)
          .join('\n') + '\n';

        const insertPosition = new vscode.Position(startLine + 1, 0);
        editBuilder.insert(insertPosition, formattedDocstring);
      } else {
        // 🔹 Cas : bloc de code ➜ insère un commentaire au-dessus
        const commentPrefix = lineText.trimStart().startsWith('//') ? '// ' : '# ';
        const formattedComment = doc
          .split('\n')
          .map(line => commentPrefix + line)
          .join('\n') + '\n';

        editBuilder.insert(selection.start, formattedComment);
      }
    });
  } catch (error) {
    console.error('[FastCoding] ❌ Erreur lors de la génération de documentation :', error);
    vscode.window.showErrorMessage("Erreur pendant la génération de documentation.");
  }
}
