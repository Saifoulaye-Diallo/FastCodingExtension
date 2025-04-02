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
          content: `Règles pour générer de la documentation Python uniquement :

          INTERDIT :
          - Générer du code Python
          - Écrire "je ne peux pas", "pourriez-vous", etc.
          - Générer un commentaire avec "# #" (double dièse)
          - Mélanger "#" et """ dans un même bloc
          - Écrire des commentaires de plus de 7 mots
          - Générer des lignes vides ou inutiles

          OBLIGATOIRE :
          - Langage ciblé : Python uniquement
          - Générer uniquement de la documentation
          - Utiliser exactement un "#" pour les commentaires simples
          - Utiliser """ pour les fonctions/classes
          - Toujours documenter uniquement ce qui suit le curseur
          - Phrase claire et courte (3 à 7 mots)

          FORMATS :
          Pour fonction/classe :
          """
          Description en une phrase.

          :param nom: Description
          :return: Description
          """

          Pour instruction simple (print, if, etc.) :
          # Description courte en 3-7 mots

          EXEMPLES :

          Entrée :
          print("Hello, world!")
          Sortie :
          # Affiche un message simple

          Entrée :
          def addition(a, b):
              return a + b
          Sortie :
          """
          Additionne deux nombres.

          :param a: Premier nombre
          :param b: Deuxième nombre
          :return: Résultat de l'addition
          """

          REJET AUTOMATIQUE si :
          - Commentaire commence par "# #"
          - Code Python généré
          - Forme incorrecte ou mélange de styles'
          `
        },
        {
          role: "user",
          content: selectedCode
        }
      ],
      temperature: 0.5,
      max_tokens: 100,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    });

    const doc = res.choices[0].message?.content?.trim();

    // ⚠Avertit si l'IA n’a rien généré
    if (!doc) {
      vscode.window.showWarningMessage("⚠ Aucune documentation générée.");
      return;
    }

    //  Calcul de l’indentation courante de la ligne sélectionnée
    const selection = editor.selection;
    const startLine = selection.start.line;
    const lineText = editor.document.lineAt(startLine).text;
    const indentMatch = lineText.match(/^\s*/);
    const indentation = indentMatch ? indentMatch[0] + '    ' : '    ';

    //  Insertion de la documentation générée
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
      const formattedComment = doc
      .split('\n')
      .filter(line => line.trim()) // ignore les lignes vides
      .map(line => {
        const trimmed = line.trim();
        return trimmed.startsWith('#') ? line : '# ' + line;
      })
      .join('\n') + '\n';

      editBuilder.insert(selection.start, formattedComment);

      }
    });
  } catch (error) {
    console.error('[FastCoding] ❌ Erreur lors de la génération de documentation :', error);
    vscode.window.showErrorMessage("Erreur pendant la génération de documentation.");
  }
}
